import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApppError } from '../errors/app.error';

export const errorHandler: ErrorRequestHandler = (error, _, res, __) => {
  if (error instanceof ApppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};
