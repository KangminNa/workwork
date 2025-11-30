import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../../application/services/admin.service';
import { AdminGreetingDto } from '../../shared/dto/admin-greeting.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('hello')
  greet(): AdminGreetingDto {
    return this.adminService.getGreeting();
  }
}
