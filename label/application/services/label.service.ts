import { Injectable } from '@nestjs/common';
import { LabelGreeting } from '../../domain/models/label-greeting.entity';
import { LabelGreetingDto } from '../../shared/dto/label-greeting.dto';

@Injectable()
export class LabelService {
  getGreeting(): LabelGreetingDto {
    const greeting: LabelGreeting = {
      message: 'Label module organizing tags',
    };
    return greeting;
  }
}
