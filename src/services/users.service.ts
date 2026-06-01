import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../database/prisma.client';
import { ApppError } from '../errors/app.error';
import { CreateUserDTO } from '../dtos/users.dto';

export class UsersService {
  async create(
    { name, email, password, role }: CreateUserDTO,
    churchId: string,
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new ApppError('E-mail já cadastrado.', StatusCodes.BAD_REQUEST);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, churchId },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async index(churchId: string) {
    const users = await prisma.user.findMany({
      where: { churchId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return users;
  }
}
