import path from 'path';
import fs from 'fs';
import { runSchemaCreation } from './schema';

function getDbPath(): string {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
  );
  const dir = isServerless ? '/tmp/taskly' : path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'taskly.db');
}

export interface SqliteStatement {
  get(...args: any[]): any;
  all(...args: any[]): any[];
  run(...args: any[]): any;
}

export interface SqliteDbWrapper {
  raw: any;
  exec(sql: string): void;
  pragma(sql: string): void;
  prepare(sql: string): SqliteStatement;
  transaction(fn: (...args: any[]) => any): (...args: any[]) => any;
}

declare global {
  // eslint-disable-next-line no-var
  var __taskly_sqlite_db: SqliteDbWrapper | undefined;
  // eslint-disable-next-line no-var
  var __taskly_sqlite_initialized: boolean | undefined;
}

function openDb(): SqliteDbWrapper {
  const dbPath = getDbPath();
  
  // Try node:sqlite (Node 22 native DatabaseSync) first
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require('node:sqlite');
    const rawDb = new DatabaseSync(dbPath);
    rawDb.exec('PRAGMA foreign_keys = ON');

    return {
      raw: rawDb,
      exec(sql: string) {
        return rawDb.exec(sql);
      },
      pragma(sql: string) {
        return rawDb.exec(`PRAGMA ${sql}`);
      },
      prepare(sql: string) {
        const stmt = rawDb.prepare(sql);
        return {
          get(...args: any[]) {
            return stmt.get(...args);
          },
          all(...args: any[]) {
            return stmt.all(...args);
          },
          run(...args: any[]) {
            return stmt.run(...args);
          },
        };
      },
      transaction(fn: (...args: any[]) => any) {
        return (...args: any[]) => {
          rawDb.exec('BEGIN TRANSACTION');
          try {
            const res = fn(...args);
            rawDb.exec('COMMIT');
            return res;
          } catch (err) {
            rawDb.exec('ROLLBACK');
            throw err;
          }
        };
      },
    };
  } catch {
    // Fallback to better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const rawDb = new Database(dbPath);
    rawDb.pragma('foreign_keys = ON');

    return {
      raw: rawDb,
      exec(sql: string) {
        return rawDb.exec(sql);
      },
      pragma(sql: string) {
        return rawDb.pragma(sql);
      },
      prepare(sql: string) {
        const stmt = rawDb.prepare(sql);
        return {
          get(...args: any[]) {
            return stmt.get(...args);
          },
          all(...args: any[]) {
            return stmt.all(...args);
          },
          run(...args: any[]) {
            return stmt.run(...args);
          },
        };
      },
      transaction(fn: (...args: any[]) => any) {
        return rawDb.transaction(fn);
      },
    };
  }
}

export function getDb(): SqliteDbWrapper {
  if (!global.__taskly_sqlite_db) {
    global.__taskly_sqlite_db = openDb();
  }
  if (!global.__taskly_sqlite_initialized) {
    global.__taskly_sqlite_initialized = true;
    runSchemaCreation(global.__taskly_sqlite_db);
  }
  return global.__taskly_sqlite_db;
}

export const sqliteDb: SqliteDbWrapper = new Proxy({} as SqliteDbWrapper, {
  get(_target, prop: string | symbol) {
    const db = getDb();
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  },
});
