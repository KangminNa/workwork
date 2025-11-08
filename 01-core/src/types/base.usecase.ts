export interface BaseUsecase<I, O> {
  execute(input: I): Promise<O>;
}
