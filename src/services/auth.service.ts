import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../database/prisma.client';
import { ApppError } from '../errors/app.error';
import { LoginDTO, RegisterDTO } from '../dtos/auth.dto';

export class AuthService {
  async register({ church, user }: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ApppError('E-mail já cadastrado.', StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const createdChurch = await prisma.church.create({
      data: {
        name: church.name,
        cnpj: church.cnpj,
        city: church.city,
        state: church.state,
        phone: church.phone,
        email: church.email,
        users: {
          create: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: 'ADMIN',
          },
        },
      },
      include: { users: true },
    });

    const createdUser = createdChurch.users[0];

    const token = jwt.sign(
      {
        userId: createdUser.id,
        churchId: createdChurch.id,
        role: createdUser.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    );

    return {
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      church: { id: createdChurch.id, name: createdChurch.name },
    };
  }

  async login({ email, password }: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { church: true },
    });

    if (!user) {
      throw new ApppError(
        'E-mail ou senha inválidos.',
        StatusCodes.UNAUTHORIZED,
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new ApppError(
        'E-mail ou senha inválidos.',
        StatusCodes.UNAUTHORIZED,
      );
    }

    const token = jwt.sign(
      { userId: user.id, churchId: user.churchId, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      church: { id: user.church.id, name: user.church.name },
    };
  }
}
