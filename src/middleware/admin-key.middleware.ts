import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApppError } from '../errors/app.error';

export function adminKeyMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    throw new ApppError('Acesso não autorizado.', StatusCodes.UNAUTHORIZED);
  }

  next();
}
