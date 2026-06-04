import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ChurchesService } from '../services/churches.service';
import { UpdateChurchDTO } from '../dtos/churches.dto';
import { BodyRequest } from './types';

export class ChurchesController {
  constructor(private churchesService: ChurchesService) {}

  show = async (_req: BodyRequest<unknown>, res: Response, next: NextFunction) => {
    try {
      const churchId = _req.auth!.churchId;
      const result = await this.churchesService.findCurrent(churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: BodyRequest<UpdateChurchDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.churchesService.update(churchId, req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
