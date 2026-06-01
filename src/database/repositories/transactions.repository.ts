import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.client';
import {
  GetDashBoarDTO,
  GetFinancialEvolutionDTO,
  IndexTransactionsDTO,
} from '../../dtos/transactions.dto';
import { Balance } from '../../entities/balance.entity';
import {
  Transaction,
  TransactionType,
} from '../../entities/transactions.entity';
import { Expense } from '../../entities/expense.entity';
import { Category } from '../../entities/category.entity';

export class TransactionsRepository {
  async create({
    title,
    date,
    amount,
    type,
    category,
  }: Transaction): Promise<Transaction> {
    const created = await prisma.transaction.create({
      data: {
        title,
        amount,
        type: type as 'income' | 'expense',
        date,
        categoryId: category._id!,
      },
      include: { category: true },
    });
    return this.toEntity(created);
  }

  async index({
    title,
    categoryId,
    beginDate,
    endDate,
  }: IndexTransactionsDTO): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...((beginDate || endDate) && {
        date: {
          ...(beginDate && { gte: beginDate }),
          ...(endDate && { lte: endDate }),
        },
      }),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { category: true },
    });

    return transactions.map(this.toEntity);
  }

  async getBalance({ beginDate, endDate }: GetDashBoarDTO): Promise<Balance> {
    const where: Prisma.TransactionWhereInput =
      beginDate || endDate
        ? {
            date: {
              ...(beginDate && { gte: beginDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {};

    const result = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });

    const incomes = result.find((r) => r.type === 'income')?._sum.amount ?? 0;
    const expenses = result.find((r) => r.type === 'expense')?._sum.amount ?? 0;

    return new Balance({
      _id: null,
      incomes,
      expenses,
      balance: incomes - expenses,
    });
  }

  async getExpense({ beginDate, endDate }: GetDashBoarDTO): Promise<Expense[]> {
    const where: Prisma.TransactionWhereInput = {
      type: 'expense',
      ...((beginDate || endDate) && {
        date: {
          ...(beginDate && { gte: beginDate }),
          ...(endDate && { lte: endDate }),
        },
      }),
    };

    const grouped = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
    });

    const categoryIds = grouped.map((r) => r.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    return grouped.map((r) => {
      const cat = categories.find((c) => c.id === r.categoryId)!;
      return new Expense({
        _id: cat.id,
        title: cat.title,
        color: cat.color,
        amount: r._sum.amount ?? 0,
      });
    });
  }

  async getFinancialEvolution({
    year,
  }: GetFinancialEvolutionDTO): Promise<Balance[]> {
    const rows = await prisma.$queryRaw<
      { year: number; month: number; incomes: bigint; expenses: bigint }[]
    >`
      SELECT
        EXTRACT(YEAR FROM date)::int  AS year,
        EXTRACT(MONTH FROM date)::int AS month,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS incomes,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
      FROM transactions
      WHERE date >= ${new Date(`${year}-01-01`)}
        AND date <= ${new Date(`${year}-12-31`)}
      GROUP BY year, month
      ORDER BY year, month
    `;

    return rows.map(
      (r) =>
        new Balance({
          _id: [r.year, r.month],
          incomes: Number(r.incomes),
          expenses: Number(r.expenses),
          balance: Number(r.incomes) - Number(r.expenses),
        }),
    );
  }

  private toEntity(raw: {
    id: string;
    title: string;
    amount: number;
    type: string;
    date: Date;
    category: { id: string; title: string; color: string };
  }): Transaction {
    return new Transaction({
      _id: raw.id,
      title: raw.title,
      amount: raw.amount,
      type: raw.type as TransactionType,
      date: raw.date,
      category: new Category({
        _id: raw.category.id,
        title: raw.category.title,
        color: raw.category.color,
      }),
    });
  }
}
