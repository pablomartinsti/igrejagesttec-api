import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApppError } from '../errors/app.error';

export function roleMiddleware(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.auth?.role;

    if (!role || !roles.includes(role)) {
      throw new ApppError(
        'Sem permissão para esta ação.',
        StatusCodes.FORBIDDEN,
      );
    }

    next();
  };
}
