import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from '@workwork/base';
import { LabelGreeting } from '../domain/models/label-greeting.entity';

@Injectable()
export class LabelRepository extends BaseInMemoryRepository<LabelGreeting> {
  constructor() {
    super([
      {
        id: 'label-default',
        message: 'Label module organizing tags',
        createdAt: new Date(),
      },
    ]);
  }
}
