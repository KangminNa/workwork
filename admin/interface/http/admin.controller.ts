import { Controller, Get } from '@nestjs/common';
import { BaseController } from '@workwork/base';
import { AdminService } from '../../application/services/admin.service';

@Controller('admin')
export class AdminController extends BaseController {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  @Get('hello')
  greet() {
    return this.success(this.adminService.getGreeting());
  }
}
