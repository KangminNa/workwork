import { Controller, Get } from '@nestjs/common';
import { BaseController } from '@workwork/base';
import { ScheduleService } from '../../application/services/schedule.service';

@Controller('schedule')
export class ScheduleController extends BaseController {
  constructor(private readonly scheduleService: ScheduleService) {
    super();
  }

  @Get('hello')
  greet() {
    return this.success(this.scheduleService.getGreeting());
  }
}
