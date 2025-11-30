import { BaseEntity } from '../entities/base.entity';

export abstract class BaseRepository<Entity extends BaseEntity> {
  protected items: Entity[] = [];

  findAll(): Entity[] {
    return this.items;
  }

  findById(id: string | number): Entity | undefined {
    return this.items.find((item) => item.id === id);
  }

  save(entity: Entity): Entity {
    const existingIndex = this.items.findIndex((item) => item.id === entity.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = entity;
    } else {
      this.items.push(entity);
    }
    return entity;
  }

  delete(id: string | number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
