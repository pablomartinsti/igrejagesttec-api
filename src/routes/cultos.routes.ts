import { Router } from 'express';
import { CultosFactory } from '../factories/cultos.factory';
import { ParamsType, validator } from '../middleware/validator.middleware';
import {
  createCultoSchema,
  createCultoCategorySchema,
  createDizimistaSchema,
  createSpiritualCategorySchema,
  createSpiritualRecordSchema,
  updateCultoSchema,
} from '../dtos/cultos.dto';
import { roleMiddleware } from '../middleware/role.middleware';

export const cultosRoutes = Router();

const controller = CultosFactory.getControllerInstance();

// categorias de culto — fixas primeiro
cultosRoutes.post(
  '/categorias',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: createCultoCategorySchema, type: ParamsType.BODY }),
  controller.createCultoCategory,
);
cultosRoutes.get('/categorias', controller.indexCultoCategories);
cultosRoutes.put(
  '/categorias/:id',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: createCultoCategorySchema, type: ParamsType.BODY }),
  controller.updateCultoCategory,
);
cultosRoutes.delete(
  '/categorias/:id',
  roleMiddleware('ADMIN'),
  controller.deleteCultoCategory,
);

// categorias espirituais
cultosRoutes.post(
  '/categorias-espirituais',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: createSpiritualCategorySchema, type: ParamsType.BODY }),
  controller.createSpiritualCategory,
);
cultosRoutes.get(
  '/categorias-espirituais',
  controller.indexSpiritualCategories,
);
cultosRoutes.put(
  '/categorias-espirituais/:id',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: createSpiritualCategorySchema, type: ParamsType.BODY }),
  controller.updateSpiritualCategory,
);
cultosRoutes.delete(
  '/categorias-espirituais/:id',
  roleMiddleware('ADMIN'),
  controller.deleteSpiritualCategory,
);

// cultos
cultosRoutes.post(
  '/',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: createCultoSchema, type: ParamsType.BODY }),
  controller.create,
);
cultosRoutes.get('/', controller.index);
cultosRoutes.get('/:id', controller.findById);
cultosRoutes.put(
  '/:id',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: updateCultoSchema, type: ParamsType.BODY }),
  controller.update,
);
cultosRoutes.delete('/:id', roleMiddleware('ADMIN'), controller.delete);

// dizimistas
cultosRoutes.post(
  '/:id/dizimistas',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: createDizimistaSchema, type: ParamsType.BODY }),
  controller.addDizimista,
);
cultosRoutes.delete(
  '/:id/dizimistas/:dizimistaId',
  roleMiddleware('ADMIN'),
  controller.removeDizimista,
);

// espiritual
cultosRoutes.post(
  '/:id/espiritual',
  roleMiddleware('ADMIN', 'TREASURER'),
  validator({ schema: createSpiritualRecordSchema, type: ParamsType.BODY }),
  controller.addSpiritualRecord,
);
cultosRoutes.delete(
  '/:id/espiritual/:recordId',
  roleMiddleware('ADMIN'),
  controller.removeSpiritualRecord,
);
