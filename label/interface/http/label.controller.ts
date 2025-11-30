import { Controller, Get } from '@nestjs/common';
import { LabelService } from '../../application/services/label.service';
import { LabelGreetingDto } from '../../shared/dto/label-greeting.dto';

@Controller('label')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get('hello')
  greet(): LabelGreetingDto {
    return this.labelService.getGreeting();
  }
}
