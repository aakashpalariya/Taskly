import { sqliteDb } from './connection';
import crypto from 'crypto';

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  avatar: string | null;
  theme_preference: string;
  sound_enabled: number;
  is_active: number;
  last_active_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const usersDb = {
  getById(id: string): UserRow | undefined {
    return sqliteDb.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  getByEmail(email: string): UserRow | undefined {
    return sqliteDb.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  },

  create(user: {
    fullName: string;
    email: string;
    passwordHash: string;
    avatar?: string | null;
  }): UserRow {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    sqliteDb.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, avatar, theme_preference, sound_enabled, is_active, last_active_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'system', 1, 1, ?, ?, ?)
    `).run(
      id,
      user.fullName.trim(),
      user.email.trim().toLowerCase(),
      user.passwordHash,
      user.avatar || null,
      now,
      now,
      now
    );

    return this.getById(id)!;
  },

  update(id: string, fields: Partial<{
    full_name: string;
    email: string;
    password_hash: string;
    avatar: string | null;
    theme_preference: string;
    sound_enabled: number;
    is_active: number;
    last_active_at: string | null;
  }>): UserRow | undefined {
    const sets: string[] = [];
    const values: any[] = [];

    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) {
        sets.push(`${k} = ?`);
        values.push(v);
      }
    }

    if (sets.length === 0) return this.getById(id);

    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    sqliteDb.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },
};
