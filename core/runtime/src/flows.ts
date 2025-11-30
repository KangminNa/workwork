import type { HandlerContext } from './types';

// Flow Base Class - 트랜잭션/감사/큐 브리지를 담당
export abstract class BaseFlow {
  abstract execute(ctx: HandlerContext, input: any): Promise<any>;

  protected async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    // TODO: Implement transaction management
    return fn();
  }

  protected async audit(ctx: HandlerContext, action: string, data?: any): Promise<void> {
    // TODO: Implement audit logging
    console.log(`[AUDIT] ${ctx.requestId} - ${action}`, data);
  }

  protected async enqueueJob(queue: string, data: any): Promise<void> {
    // TODO: Implement queue bridge
    console.log(`[QUEUE] ${queue}`, data);
  }
}
