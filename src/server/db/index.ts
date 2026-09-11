import { ensureDbInitialized } from './connection';
import { seedDatabaseIfEmpty } from './seed';

export * from './connection';
export * from './schema';
export * from './users';
export * from './projects';
export * from './tags';
export * from './tasks';
export * from './pomodoro';
export * from './admin';
export * from './seed';

// Ensure database and schema exist and are seeded
export async function initServerDb() {
  await ensureDbInitialized();
  await seedDatabaseIfEmpty();
}
