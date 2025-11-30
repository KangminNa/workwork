import { BaseRepository } from '../domain/base.repository';
import { BaseEntity } from '../domain/base.entity';

export class BaseInMemoryRepository<Entity extends BaseEntity> extends BaseRepository<Entity> {
  constructor(seed: Entity[] = []) {
    super();
    this.items = seed;
  }
}
