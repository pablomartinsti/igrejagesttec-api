import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { ApppError } from '../errors/app.error';

export type AuthPayload = {
  userId: string;
  churchId: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new ApppError('Token não informado.', StatusCodes.UNAUTHORIZED);
  }

  const [, token] = authorization.split(' ');

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    throw new ApppError('Token inválido.', StatusCodes.UNAUTHORIZED);
  }
}
