import { Router } from 'express';
import { AuthFactory } from '../factories/auth.factory';
import { ParamsType, validator } from '../middleware/validator.middleware';
import { loginSchema, registerSchema } from '../dtos/auth.dto';
import { adminKeyMiddleware } from '../middleware/admin-key.middleware';

export const authRoutes = Router();

const controller = AuthFactory.getControllerInstance();

authRoutes.post(
  '/register',
  adminKeyMiddleware,
  validator({ schema: registerSchema, type: ParamsType.BODY }),
  controller.register,
);

authRoutes.post(
  '/login',
  validator({ schema: loginSchema, type: ParamsType.BODY }),
  controller.login,
);
