import { Injectable } from '@nestjs/common';
import { ScheduleGreeting } from '../../domain/models/schedule-greeting.entity';
import { ScheduleGreetingDto } from '../../shared/dto/schedule-greeting.dto';

@Injectable()
export class ScheduleService {
  getGreeting(): ScheduleGreetingDto {
    const greeting: ScheduleGreeting = {
      message: 'Schedule module ready to plan',
    };
    return greeting;
  }
}
