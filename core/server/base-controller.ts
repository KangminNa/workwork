import { Request, Response, NextFunction } from "express";

export abstract class BaseController {
  protected wrap(handler: (req: Request, res: Response) => any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const out = await handler.call(this, req, res);
        if (!res.headersSent) res.json(out);
      } catch (err) {
        next(err);
      }
    };
  }
}
