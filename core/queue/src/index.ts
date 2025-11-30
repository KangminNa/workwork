import { Queue, QueueOptions } from 'bullmq';

export type QueueBridgeOptions = {
  name: string;
  connection: QueueOptions['connection'];
};

export function createQueue({ name, connection }: QueueBridgeOptions) {
  return new Queue(name, { connection });
}
