import { StatusCodes } from 'http-status-codes';
import { prisma } from '../database/prisma.client';
import { UpdateChurchDTO } from '../dtos/churches.dto';
import { ApppError } from '../errors/app.error';

function emptyToNull(value?: string) {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class ChurchesService {
  async findCurrent(churchId: string) {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      throw new ApppError('Igreja nao encontrada.', StatusCodes.NOT_FOUND);
    }

    return church;
  }

  async update(churchId: string, data: UpdateChurchDTO) {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      throw new ApppError('Igreja nao encontrada.', StatusCodes.NOT_FOUND);
    }

    if (data.cnpj) {
      const existing = await prisma.church.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (existing && existing.id !== churchId) {
        throw new ApppError('CNPJ ja cadastrado.', StatusCodes.BAD_REQUEST);
      }
    }

    return prisma.church.update({
      where: { id: churchId },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.cnpj !== undefined && { cnpj: emptyToNull(data.cnpj) }),
        ...(data.street !== undefined && { street: emptyToNull(data.street) }),
        ...(data.neighborhood !== undefined && {
          neighborhood: emptyToNull(data.neighborhood),
        }),
        ...(data.city !== undefined && { city: emptyToNull(data.city) }),
        ...(data.state !== undefined && { state: emptyToNull(data.state) }),
        ...(data.zipCode !== undefined && { zipCode: emptyToNull(data.zipCode) }),
        ...(data.phone !== undefined && { phone: emptyToNull(data.phone) }),
        ...(data.email !== undefined && { email: emptyToNull(data.email) }),
        ...(data.responsibleName !== undefined && {
          responsibleName: emptyToNull(data.responsibleName),
        }),
      },
    });
  }
}
