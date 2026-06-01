import { CategoriesRepository } from '../database/repositories/categories.repository';
import { CategoriesService } from '../services/categories.service';

export class CategoriesFactory {
  private static categoriesService: CategoriesService;

  static getServiceInstance(): CategoriesService {
    if (this.categoriesService) return this.categoriesService;

    const repository = new CategoriesRepository();
    this.categoriesService = new CategoriesService(repository);

    return this.categoriesService;
  }
}
