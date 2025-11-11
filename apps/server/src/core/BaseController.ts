import { Request, Response } from "express";
import { Socket } from "socket.io";

export type ControllerType = "http" | "topic" | "worker";

export abstract class BaseController {
  protected abstract type: ControllerType;

  /** 각 Controller가 구현할 메서드 */
  protected abstract executeHandler(context: any): Promise<void>;

  /** 공통 실행 Entry Point */
  async execute(context: any): Promise<void> {
    const meta = this.extractMeta(context);
    try {
      await this.beforeExecute(meta, context);
      await this.executeHandler(context);
      await this.afterExecute(meta, context);
    } catch (error) {
      this.handleError(context, error);
    }
  }

  /** 요청 메타데이터 */
  private extractMeta(context: any) {
    if (this.type === "http") return { path: context.req.path };
    if (this.type === "topic") return { path: context.event };
    return { path: context.message?.topic ?? "worker-task" };
  }

  protected async beforeExecute(meta: any, context: any) {
    console.log(`⚙️ [${this.type}] Executing ${meta.path}`);
  }

  protected async afterExecute(meta: any, context: any) {
    if (this.type === "http" && context.res && !context.res.headersSent)
      context.res.status(200).json({ success: true });
    else if (this.type === "topic")
      context.socket.emit(`${meta.path}/ack`, { success: true });
    else if (this.type === "worker")
      console.log(`✅ Worker job [${meta.path}] done`);
  }

  protected handleError(context: any, error: unknown) {
    console.error(`❌ [${this.type}]`, error);
    if (this.type === "http")
      context.res.status(500).json({ message: (error as Error).message });
    else if (this.type === "topic")
      context.socket.emit("error", (error as Error).message);
    else console.error((error as Error).message);
  }
}
