import { Category } from '../../entities/category.entity';
import { prisma } from '../prisma.client';

export class CategoriesRepository {
  async create({ title, color }: Category): Promise<Category> {
    const created = await prisma.category.create({
      data: { title, color },
    });
    return this.toEntity(created);
  }

  async findByTitle(title: string): Promise<Category | undefined> {
    const found = await prisma.category.findUnique({ where: { title } });
    return found ? this.toEntity(found) : undefined;
  }

  async findById(id: string): Promise<Category | undefined> {
    const found = await prisma.category.findUnique({ where: { id } });
    return found ? this.toEntity(found) : undefined;
  }

  async index(): Promise<Category[]> {
    const categories = await prisma.category.findMany();
    return categories.map(this.toEntity);
  }

  private toEntity(raw: {
    id: string;
    title: string;
    color: string;
  }): Category {
    return new Category({ _id: raw.id, title: raw.title, color: raw.color });
  }
}
