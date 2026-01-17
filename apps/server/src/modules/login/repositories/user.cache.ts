import { Injectable } from '@nestjs/common';
import { UserSchema } from '../models/schemas/user-schema.dto';

interface CacheEntry {
  value: UserSchema;
  expiresAt: number;
}

@Injectable()
export class UserCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly ttlMs = 60_000;

  get(key: string): UserSchema | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: UserSchema): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.store.clear();
  }
}
