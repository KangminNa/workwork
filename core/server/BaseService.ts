import { QueueManager } from "./queues/QueueManager";

export abstract class BaseService<T = any> {
  /** 실제 비즈니스 로직 */
  protected abstract run(data: any): Promise<T>;

  async execute(data: any): Promise<T> {
    const start = Date.now();
    try {
      console.log(`🧩 [Service] ${this.constructor.name} started`);
      const result = await this.run(data);
      console.log(`✅ [Service] completed in ${Date.now() - start}ms`);
      return result;
    } catch (err) {
      console.error(`❌ [Service Error]`, err);
      throw err;
    }
  }

  /** 큐 작업 등록 */
  protected async enqueue(queue: string, job: string, payload: any) {
    await QueueManager.addJob(queue, job, payload);
  }
}
