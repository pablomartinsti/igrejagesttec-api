import { Router } from 'express';
import { CultosFactory } from '../factories/cultos.factory';
import { ParamsType, validator } from '../middleware/validator.middleware';
import {
  createCultoSchema,
  createDizimistaSchema,
  createSpiritualCategorySchema,
  createSpiritualRecordSchema,
  updateCultoSchema,
} from '../dtos/cultos.dto';
import { roleMiddleware } from '../middleware/role.middleware';

export const cultosRoutes = Router();

const controller = CultosFactory.getControllerInstance();

cultosRoutes.post(
  '/categorias-espirituais',
  roleMiddleware('ADMIN'),
  validator({ schema: createSpiritualCategorySchema, type: ParamsType.BODY }),
  controller.createSpiritualCategory,
);
cultosRoutes.get(
  '/categorias-espirituais',
  controller.indexSpiritualCategories,
);

cultosRoutes.post(
  '/',
  roleMiddleware('ADMIN'),
  validator({ schema: createCultoSchema, type: ParamsType.BODY }),
  controller.create,
);
cultosRoutes.get('/', controller.index);
cultosRoutes.get('/:id', controller.findById);
cultosRoutes.put(
  '/:id',
  roleMiddleware('ADMIN'),
  validator({ schema: updateCultoSchema, type: ParamsType.BODY }),
  controller.update,
);
cultosRoutes.delete('/:id', roleMiddleware('ADMIN'), controller.delete);

cultosRoutes.post(
  '/:id/dizimistas',
  roleMiddleware('ADMIN'),
  validator({ schema: createDizimistaSchema, type: ParamsType.BODY }),
  controller.addDizimista,
);
cultosRoutes.delete(
  '/:id/dizimistas/:dizimistaId',
  roleMiddleware('ADMIN'),
  controller.removeDizimista,
);

cultosRoutes.post(
  '/:id/espiritual',
  roleMiddleware('ADMIN'),
  validator({ schema: createSpiritualRecordSchema, type: ParamsType.BODY }),
  controller.addSpiritualRecord,
);
cultosRoutes.delete(
  '/:id/espiritual/:recordId',
  roleMiddleware('ADMIN'),
  controller.removeSpiritualRecord,
);
