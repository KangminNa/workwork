import { z } from 'zod';

// Core Types
export type HandlerContext = {
  requestId: string;
  userId?: string;
  sessionId?: string;
  request: any; // Express req or Queue job
  response?: any; // Express res
};

export type Handler<Input, Output> = (ctx: HandlerContext, input: Input) => Promise<Output>;
export type FlowFunction<Input, Output> = (ctx: HandlerContext, input: Input) => Promise<Output>;

// Route Specification
export interface RouteSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: string; // module:function format like 'auth:login'
  policies?: string[];
  validation?: {
    body?: z.ZodSchema;
    params?: z.ZodSchema;
    query?: z.ZodSchema;
  };
}

export const routeSpecSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  path: z.string(),
  handler: z.string(),
  policies: z.array(z.string()).optional(),
  validation: z.object({
    body: z.any().optional(),
    params: z.any().optional(),
    query: z.any().optional(),
  }).optional(),
});
