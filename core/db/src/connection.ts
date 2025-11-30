import { DB } from './types';

// DB Connection
let dbInstance: DB | null = null;

export { DB };

export function getDB(): DB {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return dbInstance;
}

export function setDB(instance: DB): void {
  dbInstance = instance;
}
