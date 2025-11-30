import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base';
import { AuthModule } from '../../../auth/app/auth.module';
import { UserModule } from '../../../user/app/user.module';
import { ScheduleModule } from '../../../schedule/app/schedule.module';
import { NotificationModule } from '../../../notification/app/notification.module';
import { LabelModule } from '../../../label/app/label.module';
import { AdminModule } from '../../../admin/app/admin.module';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [AuthModule, UserModule, ScheduleModule, NotificationModule, LabelModule, AdminModule],
  controllers: [GatewayController],
})
export class GatewayModule extends BaseModule {
  protected moduleName = 'GatewayModule';
}
