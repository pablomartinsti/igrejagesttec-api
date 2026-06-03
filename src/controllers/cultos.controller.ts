import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CultosService } from '../services/cultos.service';
import { BodyRequest } from './types';
import {
  CreateCultoDTO,
  CreateCultoCategoryDTO,
  CreateDizimistaDTO,
  CreateSpiritualCategoryDTO,
  CreateSpiritualRecordDTO,
  UpdateCultoDTO,
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

  update = async (
    req: Request<{ id: string }, unknown, UpdateCultoDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      const result = await this.cultosService.update(id, churchId, req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      await this.cultosService.delete(id, churchId);
      res.status(StatusCodes.NO_CONTENT).send();
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

  findById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      const result = await this.cultosService.findById(id, churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  removeDizimista = async (
    req: Request<{ id: string; dizimistaId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id, dizimistaId } = req.params;
      await this.cultosService.removeDizimista(id, churchId, dizimistaId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };

  removeSpiritualRecord = async (
    req: Request<{ id: string; recordId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id, recordId } = req.params;
      await this.cultosService.removeSpiritualRecord(id, churchId, recordId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };

  addDizimista = async (
    req: Request<{ id: string }, unknown, CreateDizimistaDTO>,
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
    req: Request<{ id: string }, unknown, CreateSpiritualRecordDTO>,
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

  createCultoCategory = async (
    req: BodyRequest<CreateCultoCategoryDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.cultosService.createCultoCategory(
        req.body,
        churchId,
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  indexCultoCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.cultosService.indexCultoCategories(churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteCultoCategory = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      await this.cultosService.deleteCultoCategory(id, churchId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };
}
