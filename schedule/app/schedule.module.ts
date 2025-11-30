import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base';
import { ScheduleController } from '../interface/http/schedule.controller';
import { ScheduleService } from '../application/services/schedule.service';
import { ScheduleRepository } from '../infrastructure/schedule.repository';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository],
})
export class ScheduleModule extends BaseModule {
  protected moduleName = 'ScheduleModule';
}
