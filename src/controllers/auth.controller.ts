import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { LoginDTO, RegisterDTO } from '../dtos/auth.dto';
import { BodyRequest } from './types';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (
    req: BodyRequest<RegisterDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (
    req: BodyRequest<LoginDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      next(err);
    }
  };
}
