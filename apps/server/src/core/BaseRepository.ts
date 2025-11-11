export abstract class BaseRepository<T = any> {
  protected items: T[] = [];

  async findAll(): Promise<T[]> {
    return this.items;
  }

  async findById(id: number): Promise<T | null> {
    return this.items.find((i: any) => i.id === id) ?? null;
  }

  async save(data: T): Promise<T> {
    (data as any).id = Date.now();
    this.items.push(data);
    return data;
  }

  async update(id: number, partial: Partial<T>): Promise<T | null> {
    const found = await this.findById(id);
    if (!found) return null;
    Object.assign(found, partial);
    return found;
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.items.findIndex((i: any) => i.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}
