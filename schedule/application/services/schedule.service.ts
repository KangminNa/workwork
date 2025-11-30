import { Injectable } from '@nestjs/common';
import { BaseService } from '@workwork/base';
import { ScheduleGreeting } from '../../domain/models/schedule-greeting.entity';
import { ScheduleGreetingDto } from '../../shared/dto/schedule-greeting.dto';
import { ScheduleRepository } from '../../infrastructure/schedule.repository';

@Injectable()
export class ScheduleService extends BaseService<ScheduleGreeting> {
  constructor(private readonly scheduleRepository: ScheduleRepository) {
    super(scheduleRepository);
  }

  getGreeting(): ScheduleGreetingDto {
    return this.findById('schedule-default');
  }
}
