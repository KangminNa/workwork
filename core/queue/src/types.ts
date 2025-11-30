// Queue Names
export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  PUSH_NOTIFICATIONS: 'push_notifications',
} as const;

// Job Types
export interface NotificationJobData {
  notificationId: string;
  userId: string;
  timeBlockId: string;
  message: string;
  scheduledAt: Date;
}

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  userId: string;
}

export interface PushJobData {
  deviceToken: string;
  title: string;
  body: string;
  userId: string;
  timeBlockId?: string;
}
