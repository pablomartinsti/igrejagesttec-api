import { NextFunction, Response } from 'express';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UsersService } from '../services/users.service';
import { CreateUserDTO } from '../dtos/users.dto';
import { BodyRequest } from './types';

export class UsersController {
  constructor(private usersService: UsersService) {}

  create = async (
    req: BodyRequest<CreateUserDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.usersService.create(req.body, churchId);
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const churchId = req.auth!.churchId;
      const result = await this.usersService.index(churchId);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
