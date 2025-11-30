import { Queue, QueueOptions, Worker, Job } from 'bullmq';
import { QueueManager } from './queue-manager';
import { NotificationService } from './notification-service';
import { EmailService } from './email-service';
import { PushService } from './push-service';

// Re-export types
export * from './types';

// Re-export classes
export { QueueManager } from './queue-manager';
export { NotificationService } from './notification-service';
export { EmailService } from './email-service';
export { PushService } from './push-service';

// Re-export processors
export * from './processors';

// Global Instances
let queueManager: QueueManager | null = null;
let notificationService: NotificationService | null = null;
let emailService: EmailService | null = null;
let pushService: PushService | null = null;

// Initialization Functions
export function initQueueManager(connection: QueueOptions['connection']): QueueManager {
  queueManager = new QueueManager(connection);
  notificationService = new NotificationService(queueManager);
  emailService = new EmailService(queueManager);
  pushService = new PushService(queueManager);
  return queueManager;
}

export function getQueueManager(): QueueManager {
  if (!queueManager) {
    throw new Error('Queue manager not initialized. Call initQueueManager() first.');
  }
  return queueManager;
}

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    throw new Error('Queue manager not initialized. Call initQueueManager() first.');
  }
  return notificationService;
}

export function getEmailService(): EmailService {
  if (!emailService) {
    throw new Error('Queue manager not initialized. Call initQueueManager() first.');
  }
  return emailService;
}

export function getPushService(): PushService {
  if (!pushService) {
    throw new Error('Queue manager not initialized. Call initQueueManager() first.');
  }
  return pushService;
}

// Helper Functions
export function createQueue({ name, connection }: { name: string; connection: QueueOptions['connection'] }) {
  return new Queue(name, { connection });
}

export function createWorker(
  queueName: string,
  processor: (job: Job) => Promise<void>,
  connection: QueueOptions['connection']
) {
  return new Worker(queueName, processor, { connection });
}
