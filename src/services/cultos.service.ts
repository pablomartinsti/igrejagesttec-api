import { StatusCodes } from 'http-status-codes';
import { prisma } from '../database/prisma.client';
import { ApppError } from '../errors/app.error';
import {
  CreateCultoDTO,
  CreateDizimistaDTO,
  CreateSpiritualCategoryDTO,
  CreateSpiritualRecordDTO,
} from '../dtos/cultos.dto';

export class CultosService {
  async create({ date, type, preacher }: CreateCultoDTO, churchId: string) {
    const culto = await prisma.culto.create({
      data: { date, type, preacher, churchId },
    });
    return culto;
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

    const dizimista = await prisma.dizimista.create({
      data: { ...data, cultoId },
    });

    return dizimista;
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

    const record = await prisma.spiritualRecord.create({
      data: { value: data.value, cultoId, categoryId: data.categoryId },
      include: { category: true },
    });

    return record;
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

    const category = await prisma.spiritualCategory.create({
      data: { title: data.title, churchId },
    });

    return category;
  }

  async indexSpiritualCategories(churchId: string) {
    return prisma.spiritualCategory.findMany({ where: { churchId } });
  }
}
