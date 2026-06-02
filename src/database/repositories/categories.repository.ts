import { Category } from '../../entities/category.entity';
import { prisma } from '../prisma.client';

export class CategoriesRepository {
  async create(
    { title, color }: Category,
    churchId: string,
  ): Promise<Category> {
    const created = await prisma.category.create({
      data: { title, color, churchId },
    });
    return this.toEntity(created);
  }

  async update(
    id: string,
    data: Partial<{ title: string; color: string }>,
  ): Promise<Category> {
    const updated = await prisma.category.update({
      where: { id },
      data,
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async findByTitle(
    title: string,
    churchId: string,
  ): Promise<Category | undefined> {
    const found = await prisma.category.findUnique({
      where: { title_churchId: { title, churchId } },
    });
    return found ? this.toEntity(found) : undefined;
  }

  async findById(id: string): Promise<Category | undefined> {
    const found = await prisma.category.findUnique({ where: { id } });
    return found ? this.toEntity(found) : undefined;
  }

  async index(churchId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({ where: { churchId } });
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
