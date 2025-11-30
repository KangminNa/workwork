import { Module, OnModuleInit } from '@nestjs/common';

/**
 * Base Nest module that logs its initialization.
 * Every feature module should extend this to keep the behaviour consistent.
 */
@Module({})
export abstract class BaseModule implements OnModuleInit {
  protected abstract moduleName: string;

  onModuleInit() {
    const name = this.moduleName || this.constructor.name;
    console.log(`[BaseModule] ${name} initialized`);
  }
}
