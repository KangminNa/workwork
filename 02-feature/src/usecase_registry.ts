import { BaseUsecase } from '../../01-core/src/types';

type UseCaseClass = new (...args: any[]) => BaseUsecase<any, any>;

export class UsecaseRegistry {
  private static usecases = new Map<string, BaseUsecase<any, any>>();

  static registerUsecase(name: string, usecase: BaseUsecase<any, any>) {
    if (UsecaseRegistry.usecases.has(name)) {
      console.warn(`UseCase ${name} is already registered. Overwriting.`);
    }
    UsecaseRegistry.usecases.set(name, usecase);
  }

  static getUsecase(name: string): BaseUsecase<any, any> | undefined {
    return UsecaseRegistry.usecases.get(name);
  }
}
