import { Module } from '@nestjs/common';
import { ScheduleController } from '../interface/http/schedule.controller';
import { ScheduleService } from '../application/services/schedule.service';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
