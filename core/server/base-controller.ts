
export class BaseController {
  wrap(handler) {
    return async (req, res, next) => {
      try {
        const result = await handler.call(this, req, res);
        if (!res.headersSent) res.json(result);
      } catch (err) {
        next(err);
      }
    };
  }
}
