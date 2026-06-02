import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CultosService } from '../services/cultos.service';
import { BodyRequest } from './types';
import {
  CreateCultoDTO,
  CreateDizimistaDTO,
  CreateSpiritualCategoryDTO,
  CreateSpiritualRecordDTO,
} from '../dtos/cultos.dto';

export class CultosController {
  constructor(private cultosService: CultosService) {}

  create = async (
    req: BodyRequest<CreateCultoDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.cultosService.create(req.body, churchId);
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.cultosService.index(churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      const result = await this.cultosService.findById(id, churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  addDizimista = async (
    req: BodyRequest<CreateDizimistaDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      const result = await this.cultosService.addDizimista(
        id,
        churchId,
        req.body,
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  addSpiritualRecord = async (
    req: BodyRequest<CreateSpiritualRecordDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      const result = await this.cultosService.addSpiritualRecord(
        id,
        churchId,
        req.body,
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  createSpiritualCategory = async (
    req: BodyRequest<CreateSpiritualCategoryDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.cultosService.createSpiritualCategory(
        req.body,
        churchId,
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  indexSpiritualCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const result =
        await this.cultosService.indexSpiritualCategories(churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
