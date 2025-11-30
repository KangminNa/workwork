import { Module } from '@nestjs/common';
import { LabelController } from '../interface/http/label.controller';
import { LabelService } from '../application/services/label.service';

@Module({
  controllers: [LabelController],
  providers: [LabelService],
})
export class LabelModule {}
