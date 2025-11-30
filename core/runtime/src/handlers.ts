import { PipelineBuilder } from './pipeline';
import type { HandlerContext } from './types';

// Handler Base Class
export abstract class BaseHandler {
  protected pipeline: PipelineBuilder;

  constructor() {
    this.pipeline = new PipelineBuilder();
    this.setupMiddleware();
  }

  protected abstract setupMiddleware(): void;

  abstract handle(ctx: HandlerContext, input: any): Promise<any>;
}
