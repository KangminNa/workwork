import { Job } from 'bullmq';
import { QueueManager } from './queue-manager';
import { QUEUE_NAMES, EmailJobData } from './types';

// Email Service Class
export class EmailService {
  constructor(private queueManager: QueueManager) {}

  async sendEmail(data: EmailJobData): Promise<Job<EmailJobData>> {
    return this.queueManager.addJob(QUEUE_NAMES.EMAIL_NOTIFICATIONS, 'send_email', data);
  }
}
