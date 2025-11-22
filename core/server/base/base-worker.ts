import { Worker } from "bullmq";

export abstract class BaseWorker {
  abstract process(job: any): Promise<any>;

  init(queueName: string, connection: any) {
    new Worker(queueName, this.process.bind(this), { connection });
  }
}
