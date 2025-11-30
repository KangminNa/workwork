import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from '@workwork/base';
import { ScheduleGreeting } from '../domain/models/schedule-greeting.entity';

@Injectable()
export class ScheduleRepository extends BaseInMemoryRepository<ScheduleGreeting> {
  constructor() {
    super([
      {
        id: 'schedule-default',
        message: 'Schedule module ready to plan',
        createdAt: new Date(),
      },
    ]);
  }
}
