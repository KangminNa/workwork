import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base';
import { LabelController } from '../interface/http/label.controller';
import { LabelService } from '../application/services/label.service';
import { LabelRepository } from '../infrastructure/label.repository';

@Module({
  controllers: [LabelController],
  providers: [LabelService, LabelRepository],
})
export class LabelModule extends BaseModule {
  protected moduleName = 'LabelModule';
}
