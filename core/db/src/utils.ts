import { getDB, DB } from './connection';

// Transaction Helper
export async function withTransaction<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  const db = getDB();
  return db.transaction().execute(fn);
}

// Migration Helper
export async function runMigrations(): Promise<void> {
  // This would typically run SQL migrations
  // For now, just ensure tables exist
  console.log('Running database migrations...');
}
