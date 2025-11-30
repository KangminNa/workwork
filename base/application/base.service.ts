import { BaseRepository } from '../domain/base.repository';

export abstract class BaseService<Entity extends { id: string | number }> {
  protected constructor(protected readonly repository: BaseRepository<Entity>) {}

  findAll(): Entity[] {
    return this.repository.findAll();
  }

  findById(id: string | number) {
    const result = this.repository.findById(id);
    if (!result) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return result;
  }

  save(entity: Entity) {
    return this.repository.save(entity);
  }
}
