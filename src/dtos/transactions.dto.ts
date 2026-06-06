import { z } from 'zod';
import { TransactionType } from '../entities/transactions.entity';

export const createTransactionSchema = {
  title: z.string(),
  amount: z.number().int().positive(),
  type: z.nativeEnum(TransactionType),
  date: z.coerce.date().optional(),
  categoryId: z.string().uuid(),
  cultoId: z.string().uuid().optional(),
};

const createTransactionObject = z.object(createTransactionSchema);
export type CreatetransactionDTO = z.infer<typeof createTransactionObject>;

export const updateTransactionSchema = {
  title: z.string().optional(),
  amount: z.number().int().positive().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  date: z.coerce.date().optional(),
  categoryId: z.string().uuid().optional(),
  cultoId: z.string().uuid().optional(),
};

const updateTransactionObject = z.object(updateTransactionSchema);
export type UpdateTransactionDTO = z.infer<typeof updateTransactionObject>;

export const indexTransactionsSchema = {
  title: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  beginDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
};

const indexTransactionsObject = z.object(indexTransactionsSchema);
export type IndexTransactionsDTO = z.infer<typeof indexTransactionsObject>;

export const getDashboardSchema = {
  beginDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
};

const getDashboarObject = z.object(getDashboardSchema);
export type GetDashBoarDTO = z.infer<typeof getDashboarObject>;

export const getFinancialEvolutionSchema = {
  year: z.string(),
};

const getFinancialEvolutionObject = z.object(getFinancialEvolutionSchema);
export type GetFinancialEvolutionDTO = z.infer<
  typeof getFinancialEvolutionObject
>;
