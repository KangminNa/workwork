import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base';
import { AdminController } from '../interface/http/admin.controller';
import { AdminService } from '../application/services/admin.service';
import { AdminRepository } from '../infrastructure/admin.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
})
export class AdminModule extends BaseModule {
  protected moduleName = 'AdminModule';
}
