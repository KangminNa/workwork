import { Module } from '@nestjs/common';
import { NotificationController } from '../interface/http/notification.controller';
import { NotificationService } from '../application/services/notification.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
