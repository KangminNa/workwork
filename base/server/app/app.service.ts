import { Injectable } from '@nestjs/common';
import { resolve } from 'path';

@Injectable()
export class AppService {
  getLandingPage(): string {
    // Absolute path to the static HTML entry relative to project root.
    return resolve(process.cwd(), 'base/browser/static/index.html');
  }
}
