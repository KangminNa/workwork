import { Job } from 'bullmq';
import { NotificationJobData, EmailJobData, PushJobData } from './types';
import { getNotificationService } from './index';

// Worker Processors (예시 구현)
export const notificationWorkerProcessor = async (job: Job<NotificationJobData>) => {
  console.log(`Processing notification for user ${job.data.userId}`);

  const notificationService = getNotificationService();

  // 실제 알림 전송 로직은 여기에 구현
  // 예: 이메일과 푸시 알림을 동시에 전송
  await notificationService.sendEmailNotification({
    to: 'user@example.com', // 실제로는 DB에서 조회
    subject: '일정 알림',
    body: job.data.message,
    userId: job.data.userId,
  });

  await notificationService.sendPushNotification({
    deviceToken: 'device_token', // 실제로는 DB에서 조회
    title: '일정 알림',
    body: job.data.message,
    userId: job.data.userId,
    timeBlockId: job.data.timeBlockId,
  });
};

export const emailWorkerProcessor = async (job: Job<EmailJobData>) => {
  console.log(`Sending email to ${job.data.to}: ${job.data.subject}`);

  // 실제 이메일 전송 로직 구현 (예: nodemailer)
  // const transporter = nodemailer.createTransporter({...});
  // await transporter.sendMail({...});
};

export const pushWorkerProcessor = async (job: Job<PushJobData>) => {
  console.log(`Sending push notification to ${job.data.deviceToken}`);

  // 실제 푸시 알림 전송 로직 구현 (예: FCM, APNS)
  // const fcm = new FCM({...});
  // await fcm.send({...});
};
