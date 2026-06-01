import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TransactionsService } from '../services/transactions.service';
import {
  CreatetransactionDTO,
  GetDashBoarDTO,
  GetFinancialEvolutionDTO,
  IndexTransactionsDTO,
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
      const { title, amount, date, type, categoryId } = req.body;

      const result = await this.transactionsService.create({
        title,
        amount,
        date,
        type,
        categoryId,
      });

      res.status(StatusCodes.CREATED).json(result);
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
      const { title, categoryId, beginDate, endDate } = req.query;

      const result = await this.transactionsService.index({
        title,
        categoryId,
        beginDate,
        endDate,
      });

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
      const { beginDate, endDate } = req.query;

      const result = await this.transactionsService.getDashbord({
        beginDate,
        endDate,
      });

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
      const { year } = req.query;

      const result = await this.transactionsService.getFinancialEvolution({
        year,
      });

      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
