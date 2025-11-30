import { getDB } from './connection';

// Repository Pattern Base Class
export abstract class BaseRepository<T> {
  protected db = getDB();

  abstract findById(id: string): Promise<T | undefined>;
  abstract findAll(): Promise<T[]>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | undefined>;
  abstract delete(id: string): Promise<boolean>;
}
