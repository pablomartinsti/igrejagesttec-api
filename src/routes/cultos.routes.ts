import { Router } from 'express';
import { CultosFactory } from '../factories/cultos.factory';
import { ParamsType, validator } from '../middleware/validator.middleware';
import {
  createCultoSchema,
  createDizimistaSchema,
  createSpiritualCategorySchema,
  createSpiritualRecordSchema,
} from '../dtos/cultos.dto';

export const cultosRoutes = Router();

const controller = CultosFactory.getControllerInstance();

// rotas fixas primeiro
cultosRoutes.post(
  '/categorias-espirituais',
  validator({ schema: createSpiritualCategorySchema, type: ParamsType.BODY }),
  controller.createSpiritualCategory,
);
cultosRoutes.get(
  '/categorias-espirituais',
  controller.indexSpiritualCategories,
);

// rotas com parâmetros depois
cultosRoutes.post(
  '/',
  validator({ schema: createCultoSchema, type: ParamsType.BODY }),
  controller.create,
);
cultosRoutes.get('/', controller.index);
cultosRoutes.get('/:id', controller.findById);
cultosRoutes.post(
  '/:id/dizimistas',
  validator({ schema: createDizimistaSchema, type: ParamsType.BODY }),
  controller.addDizimista,
);
cultosRoutes.post(
  '/:id/espiritual',
  validator({ schema: createSpiritualRecordSchema, type: ParamsType.BODY }),
  controller.addSpiritualRecord,
);
