import { Controller, Get } from '@nestjs/common';
import { BaseController } from '@workwork/base';
import { LabelService } from '../../application/services/label.service';

@Controller('label')
export class LabelController extends BaseController {
  constructor(private readonly labelService: LabelService) {
    super();
  }

  @Get('hello')
  greet() {
    return this.success(this.labelService.getGreeting());
  }
}
