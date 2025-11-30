import { Module } from '@nestjs/common';
import { AdminController } from '../interface/http/admin.controller';
import { AdminService } from '../application/services/admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
