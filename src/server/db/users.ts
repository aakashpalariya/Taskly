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
  dob?: string | null;
  created_at: string;
  updated_at: string;
}

export const usersDb = {
  async getById(id: string): Promise<UserRow | undefined> {
    return await sqliteDb.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  async getByEmail(email: string): Promise<UserRow | undefined> {
    return await sqliteDb.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  },

  async create(user: {
    fullName: string;
    email: string;
    passwordHash: string;
    avatar?: string | null;
    dob?: string | null;
  }): Promise<UserRow> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await sqliteDb.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, avatar, theme_preference, sound_enabled, is_active, last_active_at, dob, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'system', 1, 1, ?, ?, ?, ?)
    `).run(
      id,
      user.fullName.trim(),
      user.email.trim().toLowerCase(),
      user.passwordHash,
      user.avatar || null,
      now,
      user.dob || null,
      now,
      now
    );

    const created = await this.getById(id);
    return created!;
  },

  async update(id: string, fields: Partial<{
    full_name: string;
    email: string;
    password_hash: string;
    avatar: string | null;
    theme_preference: string;
    sound_enabled: number;
    is_active: number;
    last_active_at: string | null;
    dob: string | null;
  }>): Promise<UserRow | undefined> {
    const sets: string[] = [];
    const values: any[] = [];

    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) {
        sets.push(`${k} = ?`);
        values.push(v);
      }
    }

    if (sets.length === 0) return await this.getById(id);

    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await sqliteDb.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return await this.getById(id);
  },
};
