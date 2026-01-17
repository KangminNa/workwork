import { Injectable } from '@nestjs/common';
import { IUserRepository } from './login.repository.interface';
import { UserRepository } from './user.repository';
import { UserCache } from './user.cache';
import { User } from '../models/entities/user.entity';
import { UserSchema } from '../models/schemas/user-schema.dto';

/**
 * Cached User Repository
 * - Read-through 캐시 + save/delete 시 전체 캐시 무효화
 */
@Injectable()
export class CachedUserRepository implements IUserRepository {
  constructor(
    private readonly repository: UserRepository,
    private readonly cache: UserCache,
  ) {}

  async findOne(where: Partial<UserSchema>): Promise<User | null> {
    const key = this.cacheKey(where);
    const cached = this.cache.get(key);
    if (cached) {
      return this.toDomain(cached);
    }

    const user = await this.repository.findOne(where);
    if (user) {
      this.cache.set(key, user.toPersistence() as UserSchema);
    }

    return user;
  }

  async findMany(where?: Partial<UserSchema>): Promise<User[]> {
    return this.repository.findMany(where);
  }

  async exists(where: Partial<UserSchema>): Promise<boolean> {
    const user = await this.findOne(where);
    return !!user;
  }

  async count(where?: Partial<UserSchema>): Promise<number> {
    return this.repository.count(where);
  }

  async save(entity: User): Promise<User> {
    const saved = await this.repository.save(entity);
    this.cache.clear();
    return saved;
  }

  async delete(where: Partial<UserSchema>): Promise<void> {
    await this.repository.delete(where);
    this.cache.clear();
  }

  private cacheKey(where: Partial<UserSchema>): string {
    return `user:${this.stableStringify(where)}`;
  }

  private stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `"${key}":${this.stableStringify(val)}`);

    return `{${entries.join(',')}}`;
  }

  private toDomain(schema: UserSchema): User {
    return User.reconstitute({
      id: schema.id,
      email: schema.email,
      username: schema.username,
      hashedPassword: schema.password,
      role: schema.role,
      status: schema.status,
      groupId: schema.groupId,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
}
