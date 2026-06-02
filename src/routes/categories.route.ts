import { Router } from 'express';
import { CategoriesController } from '../controllers/category.controller';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../dtos/categories.dto';
import { CategoriesFactory } from '../factories/categories.factory';
import { ParamsType, validator } from '../middleware/validator.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

export const categoriesRoutes = Router();

const controller = new CategoriesController(
  CategoriesFactory.getServiceInstance(),
);

categoriesRoutes.get('/', controller.index);
categoriesRoutes.post(
  '/',
  roleMiddleware('ADMIN'),
  validator({ schema: createCategorySchema, type: ParamsType.BODY }),
  controller.create,
);
categoriesRoutes.put(
  '/:id',
  roleMiddleware('ADMIN'),
  validator({ schema: updateCategorySchema, type: ParamsType.BODY }),
  controller.update,
);
categoriesRoutes.delete('/:id', roleMiddleware('ADMIN'), controller.delete);
