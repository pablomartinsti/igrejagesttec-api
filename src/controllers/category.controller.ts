import { NextFunction, Request, Response } from 'express';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/categories.dto';
import { StatusCodes } from 'http-status-codes';
import { BodyRequest } from './types';

export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  create = async (
    req: BodyRequest<CreateCategoryDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { title, color } = req.body;
      const result = await this.categoriesService.create(
        { title, color },
        churchId,
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<{ id: string }, unknown, UpdateCategoryDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      const result = await this.categoriesService.update(
        id,
        churchId,
        req.body,
      );
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
      await this.categoriesService.delete(id, churchId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.categoriesService.index(churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
