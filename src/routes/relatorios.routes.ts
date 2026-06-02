import { Router } from 'express';
import { RelatoriosFactory } from '../factories/relatorios.factory';

export const relatoriosRoutes = Router();

const controller = RelatoriosFactory.getControllerInstance();

relatoriosRoutes.get('/culto/:cultoId', controller.porCulto);
relatoriosRoutes.get('/periodo', controller.porPeriodo);
relatoriosRoutes.get('/anual', controller.anual);
