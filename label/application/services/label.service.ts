import { Injectable } from '@nestjs/common';
import { BaseService } from '@workwork/base';
import { LabelGreeting } from '../../domain/models/label-greeting.entity';
import { LabelGreetingDto } from '../../shared/dto/label-greeting.dto';
import { LabelRepository } from '../../infrastructure/label.repository';

@Injectable()
export class LabelService extends BaseService<LabelGreeting> {
  constructor(private readonly labelRepository: LabelRepository) {
    super(labelRepository);
  }

  getGreeting(): LabelGreetingDto {
    return this.findById('label-default');
  }
}
