import { Controller, Get } from '@nestjs/common';
import { ScheduleService } from '../../application/services/schedule.service';
import { ScheduleGreetingDto } from '../../shared/dto/schedule-greeting.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('hello')
  greet(): ScheduleGreetingDto {
    return this.scheduleService.getGreeting();
  }
}
