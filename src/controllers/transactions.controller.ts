import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TransactionsService } from '../services/transactions.service';
import {
  CreatetransactionDTO,
  GetDashBoarDTO,
  GetFinancialEvolutionDTO,
  IndexTransactionsDTO,
  UpdateTransactionDTO,
} from '../dtos/transactions.dto';
import { BodyRequest, QueryRequest } from './types';

export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  create = async (
    req: BodyRequest<CreatetransactionDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { title, amount, date, type, categoryId, cultoId } = req.body; // ← adicionar cultoId
      const result = await this.transactionsService.create(
        { title, amount, date, type, categoryId, cultoId }, // ← passar cultoId
        churchId,
      );
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request<{ id: string }, unknown, UpdateTransactionDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { id } = req.params;
      const result = await this.transactionsService.update(
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
      await this.transactionsService.delete(id, churchId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
      next(err);
    }
  };

  index = async (
    req: QueryRequest<IndexTransactionsDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { title, categoryId, beginDate, endDate } = req.query;
      const result = await this.transactionsService.index(
        { title, categoryId, beginDate, endDate },
        churchId,
      );
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  getDashboard = async (
    req: QueryRequest<GetDashBoarDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { beginDate, endDate } = req.query;
      const result = await this.transactionsService.getDashbord(
        { beginDate, endDate },
        churchId,
      );
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  getFinancialEvolution = async (
    req: QueryRequest<GetFinancialEvolutionDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const { year } = req.query;
      const result = await this.transactionsService.getFinancialEvolution(
        { year },
        churchId,
      );
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
