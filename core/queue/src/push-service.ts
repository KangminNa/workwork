import { Job } from 'bullmq';
import { QueueManager } from './queue-manager';
import { QUEUE_NAMES, PushJobData } from './types';

// Push Service Class
export class PushService {
  constructor(private queueManager: QueueManager) {}

  async sendPush(data: PushJobData): Promise<Job<PushJobData>> {
    return this.queueManager.addJob(QUEUE_NAMES.PUSH_NOTIFICATIONS, 'send_push', data);
  }
}
