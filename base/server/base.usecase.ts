// This file can be used for abstract use cases if needed
export abstract class BaseUseCase<T, R> {
  abstract execute(input: T): Promise<R> | R;
}
