import { StatusCodes } from 'http-status-codes';
import { prisma } from '../database/prisma.client';
import { ApppError } from '../errors/app.error';
import {
  CreateCultoDTO,
  CreateDizimistaDTO,
  CreateSpiritualCategoryDTO,
  CreateSpiritualRecordDTO,
  UpdateCultoDTO,
} from '../dtos/cultos.dto';

export class CultosService {
  async create({ date, type, preacher }: CreateCultoDTO, churchId: string) {
    const culto = await prisma.culto.create({
      data: { date, type, preacher, churchId },
    });
    return culto;
  }

  async update(id: string, churchId: string, data: UpdateCultoDTO) {
    const culto = await prisma.culto.findFirst({ where: { id, churchId } });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    const updated = await prisma.culto.update({
      where: { id },
      data,
    });

    return updated;
  }

  async delete(id: string, churchId: string) {
    const culto = await prisma.culto.findFirst({ where: { id, churchId } });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    await prisma.dizimista.deleteMany({ where: { cultoId: id } });
    await prisma.spiritualRecord.deleteMany({ where: { cultoId: id } });
    await prisma.transaction.deleteMany({ where: { cultoId: id } }); // ← adicionar essa linha
    await prisma.culto.delete({ where: { id } });
  }

  async removeDizimista(
    cultoId: string,
    churchId: string,
    dizimistaId: string,
  ) {
    const culto = await prisma.culto.findFirst({
      where: { id: cultoId, churchId },
    });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    const dizimista = await prisma.dizimista.findFirst({
      where: { id: dizimistaId, cultoId },
    });

    if (!dizimista) {
      throw new ApppError('Dizimista não encontrado.', StatusCodes.NOT_FOUND);
    }

    await prisma.dizimista.delete({ where: { id: dizimistaId } });
  }

  async removeSpiritualRecord(
    cultoId: string,
    churchId: string,
    recordId: string,
  ) {
    const culto = await prisma.culto.findFirst({
      where: { id: cultoId, churchId },
    });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    const record = await prisma.spiritualRecord.findFirst({
      where: { id: recordId, cultoId },
    });

    if (!record) {
      throw new ApppError(
        'Registro espiritual não encontrado.',
        StatusCodes.NOT_FOUND,
      );
    }

    await prisma.spiritualRecord.delete({ where: { id: recordId } });
  }

  async index(churchId: string) {
    const cultos = await prisma.culto.findMany({
      where: { churchId },
      orderBy: { date: 'desc' },
      include: {
        dizimistas: true,
        spiritualRecords: { include: { category: true } },
        transactions: { include: { category: true } },
      },
    });
    return cultos;
  }

  async findById(id: string, churchId: string) {
    const culto = await prisma.culto.findFirst({
      where: { id, churchId },
      include: {
        dizimistas: true,
        spiritualRecords: { include: { category: true } },
        transactions: { include: { category: true } },
      },
    });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    return culto;
  }

  async addDizimista(
    cultoId: string,
    churchId: string,
    data: CreateDizimistaDTO,
  ) {
    const culto = await prisma.culto.findFirst({
      where: { id: cultoId, churchId },
    });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    return prisma.dizimista.create({
      // cast to any to satisfy prisma generated types when optional fields may be omitted
      data: {
        cultoId,
        amount: data.amount,
        ...(data.name ? { name: data.name } : {}),
        ...(data.contributionType
          ? { contributionType: data.contributionType }
          : {}),
      } as any,
    });
  }

  async addSpiritualRecord(
    cultoId: string,
    churchId: string,
    data: CreateSpiritualRecordDTO,
  ) {
    const culto = await prisma.culto.findFirst({
      where: { id: cultoId, churchId },
    });

    if (!culto) {
      throw new ApppError('Culto não encontrado.', StatusCodes.NOT_FOUND);
    }

    const category = await prisma.spiritualCategory.findFirst({
      where: { id: data.categoryId, churchId },
    });

    if (!category) {
      throw new ApppError(
        'Categoria espiritual não encontrada.',
        StatusCodes.NOT_FOUND,
      );
    }

    return prisma.spiritualRecord.create({
      data: { value: data.value, cultoId, categoryId: data.categoryId },
      include: { category: true },
    });
  }

  async createSpiritualCategory(
    data: CreateSpiritualCategoryDTO,
    churchId: string,
  ) {
    const existing = await prisma.spiritualCategory.findFirst({
      where: { title: data.title, churchId },
    });

    if (existing) {
      throw new ApppError(
        'Categoria espiritual já existe.',
        StatusCodes.BAD_REQUEST,
      );
    }

    return prisma.spiritualCategory.create({
      data: { title: data.title, churchId },
    });
  }

  async indexSpiritualCategories(churchId: string) {
    return prisma.spiritualCategory.findMany({ where: { churchId } });
  }
}
