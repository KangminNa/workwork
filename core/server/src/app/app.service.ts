import { Injectable } from '@nestjs/common';
import { helloFromTest } from '@workwork/test';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: helloFromTest() };
  }
}
