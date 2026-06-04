import { Router } from 'express';
import { ChurchesFactory } from '../factories/churches.factory';
import { ParamsType, validator } from '../middleware/validator.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { updateChurchSchema } from '../dtos/churches.dto';

export const churchesRoutes = Router();

const controller = ChurchesFactory.getControllerInstance();

churchesRoutes.get('/', controller.show);
churchesRoutes.put(
  '/',
  roleMiddleware('ADMIN'),
  validator({ schema: updateChurchSchema, type: ParamsType.BODY }),
  controller.update,
);
