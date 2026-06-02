import { Router } from 'express';
import { ParamsType, validator } from '../middleware/validator.middleware';
import { TransactionsController } from '../controllers/transactions.controller';
import { TransactionsFactory } from '../factories/transactions.factory';
import {
  createTransactionSchema,
  getDashboardSchema,
  getFinancialEvolutionSchema,
  indexTransactionsSchema,
  updateTransactionSchema,
} from '../dtos/transactions.dto';
import { roleMiddleware } from '../middleware/role.middleware';

export const transactionsRoutes = Router();

const controller = new TransactionsController(
  TransactionsFactory.getServiceInstance(),
);

transactionsRoutes.get(
  '/',
  validator({ schema: indexTransactionsSchema, type: ParamsType.QUERY }),
  controller.index,
);
transactionsRoutes.get(
  '/dashboard',
  validator({ schema: getDashboardSchema, type: ParamsType.QUERY }),
  controller.getDashboard,
);
transactionsRoutes.get(
  '/financial-evolution',
  validator({ schema: getFinancialEvolutionSchema, type: ParamsType.QUERY }),
  controller.getFinancialEvolution,
);
transactionsRoutes.post(
  '/',
  roleMiddleware('ADMIN'),
  validator({ schema: createTransactionSchema, type: ParamsType.BODY }),
  controller.create,
);
transactionsRoutes.put(
  '/:id',
  roleMiddleware('ADMIN'),
  validator({ schema: updateTransactionSchema, type: ParamsType.BODY }),
  controller.update,
);
transactionsRoutes.delete('/:id', roleMiddleware('ADMIN'), controller.delete);
