import { z } from 'zod';

export type HandlerContext = {
  requestId: string;
  userId?: string;
};

export type Handler<Input, Output> = (ctx: HandlerContext, input: Input) => Promise<Output>;

export const routeSpecSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  path: z.string(),
  handler: z.string(),
  policies: z.array(z.string()).optional(),
});

export function createPipeline<TInput, TOutput>(handler: Handler<TInput, TOutput>) {
  return async (ctx: HandlerContext, input: TInput): Promise<TOutput> => {
    // TODO: tracing, auth, validation hooks
    return handler(ctx, input);
  };
}
