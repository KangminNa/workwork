import { BaseRepository } from './base.repository';
import { BaseEntity } from '../entities/base.entity';

export class BaseInMemoryRepository<Entity extends BaseEntity> extends BaseRepository<Entity> {
  constructor(seed: Entity[] = []) {
    super();
    this.items = seed;
  }
}
