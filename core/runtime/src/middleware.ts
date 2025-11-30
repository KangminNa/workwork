import { generateRequestId } from './utils';
import type { HandlerContext } from './types';
import type { Middleware } from './pipeline';

// Common Middleware
export const requestIdMiddleware: Middleware = {
  name: 'requestId',
  execute: async (ctx, next) => {
    if (!ctx.requestId) {
      ctx.requestId = generateRequestId();
    }
    return next();
  },
};

export const loggingMiddleware: Middleware = {
  name: 'logging',
  execute: async (ctx, next) => {
    const start = Date.now();
    console.log(`[REQUEST] ${ctx.requestId} - Start`);
    try {
      const result = await next();
      console.log(`[REQUEST] ${ctx.requestId} - Success (${Date.now() - start}ms)`);
      return result;
    } catch (error) {
      console.error(`[REQUEST] ${ctx.requestId} - Error (${Date.now() - start}ms)`, error);
      throw error;
    }
  },
};
