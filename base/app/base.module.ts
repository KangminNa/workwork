import { Module, OnModuleInit } from '@nestjs/common';

@Module({})
export abstract class BaseModule implements OnModuleInit {
  protected abstract moduleName: string;

  onModuleInit() {
    const name = this.moduleName || this.constructor.name;
    console.log(`[BaseModule] ${name} initialized`);
  }
}
