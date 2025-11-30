import { Job } from 'bullmq';
import { QueueManager } from './queue-manager';
import { QUEUE_NAMES, NotificationJobData, EmailJobData, PushJobData } from './types';

// Notification Service Class
export class NotificationService {
  constructor(private queueManager: QueueManager) {}

  async scheduleNotification(data: NotificationJobData): Promise<Job<NotificationJobData>> {
    return this.queueManager.addJob(
      QUEUE_NAMES.NOTIFICATIONS,
      'send_notification',
      data,
      { delay: data.scheduledAt.getTime() - Date.now() }
    );
  }

  async sendEmailNotification(data: EmailJobData): Promise<Job<EmailJobData>> {
    return this.queueManager.addJob(QUEUE_NAMES.EMAIL_NOTIFICATIONS, 'send_email', data);
  }

  async sendPushNotification(data: PushJobData): Promise<Job<PushJobData>> {
    return this.queueManager.addJob(QUEUE_NAMES.PUSH_NOTIFICATIONS, 'send_push', data);
  }
}
