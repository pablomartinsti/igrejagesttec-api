import { Router } from 'express';
import { baseRoutes } from './base.route';
import { categoriesRoutes } from './categories.route';
import { transactionsRoutes } from './transactions.routes';
import { authRoutes } from './auth.routes';
import { usersRoutes } from './users.routes';
import { cultosRoutes } from './cultos.routes';
import { authMiddleware } from '../middleware/auth.middleware';

export const routes = Router();

routes.use('/', baseRoutes);
routes.use('/auth', authRoutes);

routes.use(authMiddleware);

routes.use('/categories', categoriesRoutes);
routes.use('/transactions', transactionsRoutes);
routes.use('/users', usersRoutes);
routes.use('/cultos', cultosRoutes);
