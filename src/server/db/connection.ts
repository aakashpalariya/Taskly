import { createClient, Client } from '@libsql/client';
import { runSchemaCreation } from './schema';

const DEFAULT_TURSO_URL = 'libsql://taskly-aakashpalariya.aws-ap-south-1.turso.io';
const DEFAULT_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkxMTIyMTYsImlkIjoiMDFhMDhmNjUtYzUwMS03OGIzLWIyNWUtMDRjYWI1M2Q4OWRlIiwia2lkIjoibHAzN0hHLXNSSFIwbzhpbVBBUmF6NXlYanlnMWhINDk4SUJVSkY1dGN3VSIsInJpZCI6ImNkZjgzOTZkLTRiYzYtNDdlNS1iYWQ3LWU5ZGNhMjZjNDVlMiJ9.N81jIfbqN379h9DMdRciSp8hl_34ZT84UrDVw8U2HHYof9sV8SG52-7CEwO_nHFEGfaXZNZgfbMW8y05v6NdBA';

export interface SqliteStatement {
  get(...args: any[]): Promise<any>;
  all(...args: any[]): Promise<any[]>;
  run(...args: any[]): Promise<{ changes: number; lastInsertRowid?: any }>;
}

export interface SqliteDbWrapper {
  raw: Client;
  exec(sql: string): Promise<void>;
  pragma(sql: string): Promise<any>;
  prepare(sql: string): SqliteStatement;
  transaction<T>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T>;
}

declare global {
  // eslint-disable-next-line no-var
  var __taskly_turso_client: Client | undefined;
  // eslint-disable-next-line no-var
  var __taskly_sqlite_db: SqliteDbWrapper | undefined;
  // eslint-disable-next-line no-var
  var __taskly_sqlite_initialized: boolean | undefined;
}

function normalizeArgs(args: any[]): any[] {
  if (args.length === 1 && Array.isArray(args[0])) {
    return args[0];
  }
  return args;
}

function createLibsqlWrapper(client: Client): SqliteDbWrapper {
  return {
    raw: client,
    async exec(sql: string) {
      await client.executeMultiple(sql);
    },
    async pragma(_sql: string) {
      // Turso manages pragmas at the server level
      return null;
    },
    prepare(sql: string): SqliteStatement {
      return {
        async get(...args: any[]) {
          const flatArgs = normalizeArgs(args);
          const res = await client.execute({ sql, args: flatArgs });
          return res.rows[0] ? { ...res.rows[0] } : undefined;
        },
        async all(...args: any[]) {
          const flatArgs = normalizeArgs(args);
          const res = await client.execute({ sql, args: flatArgs });
          return res.rows.map((row) => ({ ...row }));
        },
        async run(...args: any[]) {
          const flatArgs = normalizeArgs(args);
          const res = await client.execute({ sql, args: flatArgs });
          return {
            changes: res.rowsAffected,
            lastInsertRowid: res.lastInsertRowid,
          };
        },
      };
    },
    transaction<T>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T> {
      return async (...args: any[]) => {
        return await fn(...args);
      };
    },
  };
}

export function getDb(): SqliteDbWrapper {
  if (!global.__taskly_turso_client) {
    const url = process.env.TURSO_DATABASE_URL || DEFAULT_TURSO_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;

    global.__taskly_turso_client = createClient({
      url,
      authToken,
    });
  }

  if (!global.__taskly_sqlite_db) {
    global.__taskly_sqlite_db = createLibsqlWrapper(global.__taskly_turso_client);
  }

  return global.__taskly_sqlite_db;
}

export async function ensureDbInitialized(): Promise<SqliteDbWrapper> {
  const db = getDb();
  if (!global.__taskly_sqlite_initialized) {
    global.__taskly_sqlite_initialized = true;
    try {
      await runSchemaCreation(db);
    } catch (err) {
      console.error('Turso schema initialization error:', err);
    }
  }
  return db;
}

export const sqliteDb: SqliteDbWrapper = new Proxy({} as SqliteDbWrapper, {
  get(_target, prop: string | symbol) {
    const db = getDb();
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  },
});
