import { CategoriesRepository } from '../database/repositories/categories.repository';
import { TransactionsRepository } from '../database/repositories/transactions.repository';
import { TransactionsService } from '../services/transactions.service';

export class TransactionsFactory {
  private static transactionsService: TransactionsService;

  static getServiceInstance(): TransactionsService {
    if (this.transactionsService) return this.transactionsService;

    const repository = new TransactionsRepository();
    const categoriesRepository = new CategoriesRepository();
    this.transactionsService = new TransactionsService(
      repository,
      categoriesRepository,
    );

    return this.transactionsService;
  }
}
