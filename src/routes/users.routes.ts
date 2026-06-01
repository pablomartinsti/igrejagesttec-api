import { Router } from 'express';
import { UsersFactory } from '../factories/users.factory';
import { ParamsType, validator } from '../middleware/validator.middleware';
import { createUserSchema } from '../dtos/users.dto';
import { roleMiddleware } from '../middleware/role.middleware';

export const usersRoutes = Router();

const controller = UsersFactory.getControllerInstance();

usersRoutes.get('/', roleMiddleware('ADMIN'), controller.index);
usersRoutes.post(
  '/',
  roleMiddleware('ADMIN'),
  validator({ schema: createUserSchema, type: ParamsType.BODY }),
  controller.create,
);
