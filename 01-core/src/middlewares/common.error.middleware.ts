import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, API_ERROR_CODE } from '../types/error.types';

export function commonErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || API_ERROR_CODE.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      errorCode,
    },
  });
}
