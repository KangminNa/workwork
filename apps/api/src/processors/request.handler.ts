import { Request, Response, NextFunction } from 'express';

export function requestHandler(req: Request, res: Response, next: NextFunction) {
  const result = res.locals.usecaseResult;
  if (result) {
    res.status(200).json(result);
  } else {
    next(new Error('No usecase result found.'));
  }
}
