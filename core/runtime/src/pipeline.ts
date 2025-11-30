import type { Handler, HandlerContext } from './types';

// Pipeline Builder
export interface Middleware {
  name: string;
  execute: (ctx: HandlerContext, next: () => Promise<any>) => Promise<any>;
}

export class PipelineBuilder {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): PipelineBuilder {
    this.middlewares.push(middleware);
    return this;
  }

  build<TInput, TOutput>(handler: Handler<TInput, TOutput>): Handler<TInput, TOutput> {
    return async (ctx: HandlerContext, input: TInput): Promise<TOutput> => {
      let index = 0;

      const next = async (): Promise<TOutput> => {
        if (index < this.middlewares.length) {
          const middleware = this.middlewares[index++];
          return middleware.execute(ctx, next);
        }
        return handler(ctx, input);
      };

      return next();
    };
  }
}
