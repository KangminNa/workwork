import { Worker, Job } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null
});

export class QueueProcessor {
  private static listeners: ((queue: string, job: string, data: any) => Promise<void>)[] = [];

  static onJob(listener: (queue: string, job: string, data: any) => Promise<void>) {
    this.listeners.push(listener);
  }

  static register(queueName: string) {
    const worker = new Worker(
      queueName,
      async (job: Job) => {
        for (const listener of this.listeners) {
          // Worker 타입의 Controller를 실행하기 위해 job.name을 path로 사용합니다.
          await listener(queueName, job.name, job.data);
        }
      },
      { connection }
    );

    worker.on("completed", (job) => console.log(`✅ ${queueName}:${job.id} completed`));
    worker.on("failed", (job, err) =>
      console.error(`❌ ${queueName}:${job?.id} failed:`, err.message)
    );

    console.log(`🐂 Worker registered for queue: ${queueName}`);
  }
}
