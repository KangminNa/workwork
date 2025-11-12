import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
});

export class QueueManager {
  private static queues = new Map<string, Queue>();

  static getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, { connection });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  static async addJob(queueName: string, jobName: string, data: any) {
    const queue = this.getQueue(queueName);
    await queue.add(jobName, data);
  }
}
