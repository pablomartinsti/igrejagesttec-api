import { StatusCodes } from 'http-status-codes';
import { CategoriesRepository } from '../database/repositories/categories.repository';
import { TransactionsRepository } from '../database/repositories/transactions.repository';
import {
  CreatetransactionDTO,
  GetDashBoarDTO,
  GetFinancialEvolutionDTO,
  IndexTransactionsDTO,
} from '../dtos/transactions.dto';
import { Transaction } from '../entities/transactions.entity';
import { ApppError } from '../errors/app.error';
import { Balance } from '../entities/balance.entity';
import { Expense } from '../entities/expense.entity';

export class TransactionsService {
  constructor(
    private transactionsRepository: TransactionsRepository,
    private categoriesRepository: CategoriesRepository,
  ) {}

  async create(
    { title, type, date, categoryId, amount, cultoId }: CreatetransactionDTO,
    churchId: string,
  ): Promise<Transaction> {
    const category = await this.categoriesRepository.findById(categoryId);

    if (!category) {
      throw new ApppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
    }

    const transaction = new Transaction({
      title,
      type,
      date,
      category,
      amount,
    });
    return this.transactionsRepository.create(transaction, churchId, cultoId);
  }

  async update(
    id: string,
    churchId: string,
    data: Partial<CreatetransactionDTO>,
  ): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findById(
      id,
      churchId,
    );

    if (!transaction) {
      throw new ApppError('Transação não encontrada.', StatusCodes.NOT_FOUND);
    }

    if (data.categoryId) {
      const category = await this.categoriesRepository.findById(
        data.categoryId,
      );
      if (!category) {
        throw new ApppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
      }
    }

    return this.transactionsRepository.update(id, churchId, data);
  }

  async delete(id: string, churchId: string): Promise<void> {
    const transaction = await this.transactionsRepository.findById(
      id,
      churchId,
    );

    if (!transaction) {
      throw new ApppError('Transação não encontrada.', StatusCodes.NOT_FOUND);
    }

    await this.transactionsRepository.delete(id);
  }

  async index(
    filters: IndexTransactionsDTO,
    churchId: string,
  ): Promise<Transaction[]> {
    return this.transactionsRepository.index({ ...filters, churchId });
  }

  async getDashbord(
    { beginDate, endDate }: GetDashBoarDTO,
    churchId: string,
  ): Promise<{ balance: Balance; expenses: Expense[] }> {
    let [balance, expenses] = await Promise.all([
      this.transactionsRepository.getBalance({ beginDate, endDate, churchId }),
      this.transactionsRepository.getExpense({ beginDate, endDate, churchId }),
    ]);

    if (!balance) {
      balance = new Balance({ _id: null, incomes: 0, expenses: 0, balance: 0 });
    }

    return { balance, expenses };
  }

  async getFinancialEvolution(
    { year }: GetFinancialEvolutionDTO,
    churchId: string,
  ): Promise<Balance[]> {
    return this.transactionsRepository.getFinancialEvolution({
      year,
      churchId,
    });
  }
}
