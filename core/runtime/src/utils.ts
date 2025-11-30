import type { Handler } from './types';

// Utility Functions
export function createPipeline<TInput, TOutput>(handler: Handler<TInput, TOutput>): Handler<TInput, TOutput> {
  return handler; // Simplified for now - will be enhanced with middleware
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
