import { Worker } from "bullmq";
export class BaseWorker {
    init(queueName, connection) {
        new Worker(queueName, this.process.bind(this), { connection });
    }
}
