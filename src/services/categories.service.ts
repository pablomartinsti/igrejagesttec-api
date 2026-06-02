import { StatusCodes } from 'http-status-codes';
import { CategoriesRepository } from '../database/repositories/categories.repository';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/categories.dto';
import { Category } from '../entities/category.entity';
import { ApppError } from '../errors/app.error';

export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async create(
    { title, color }: CreateCategoryDTO,
    churchId: string,
  ): Promise<Category> {
    const foundCategory = await this.categoriesRepository.findByTitle(
      title,
      churchId,
    );

    if (foundCategory) {
      throw new ApppError('Categoria já existe.', StatusCodes.BAD_REQUEST);
    }

    const category = new Category({ title, color });
    return this.categoriesRepository.create(category, churchId);
  }

  async update(
    id: string,
    churchId: string,
    data: UpdateCategoryDTO,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);

    if (!category || category._id !== id) {
      throw new ApppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
    }

    return this.categoriesRepository.update(id, data);
  }

  async delete(id: string, churchId: string): Promise<void> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new ApppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
    }

    await this.categoriesRepository.delete(id);
  }

  async index(churchId: string): Promise<Category[]> {
    return this.categoriesRepository.index(churchId);
  }
}
