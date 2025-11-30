import { Queue, QueueOptions, Worker, Job, JobsOptions } from 'bullmq';

// Queue Manager
export class QueueManager {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(private connection: QueueOptions['connection']) {}

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, { connection: this.connection });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  async addJob<T>(
    queueName: string,
    jobName: string,
    data: T,
    options: JobsOptions = {}
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options,
    });
  }

  registerWorker(
    queueName: string,
    processor: (job: Job) => Promise<void>,
    options: { concurrency?: number } = {}
  ): void {
    if (this.workers.has(queueName)) {
      throw new Error(`Worker for queue ${queueName} already registered`);
    }

    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency: options.concurrency || 5,
    });

    worker.on('completed', (job) => {
      console.log(`[QUEUE] Job ${job?.id} in ${queueName} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[QUEUE] Job ${job?.id} in ${queueName} failed:`, err);
    });

    this.workers.set(queueName, worker);
  }

  async close(): Promise<void> {
    const closePromises = [
      ...Array.from(this.queues.values()).map(queue => queue.close()),
      ...Array.from(this.workers.values()).map(worker => worker.close()),
    ];
    await Promise.all(closePromises);
  }
}
