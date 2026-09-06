import { sqliteDb } from './connection';
import crypto from 'crypto';

export interface TagRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export const tagsDb = {
  getByUser(userId: string): TagRow[] {
    return sqliteDb.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC').all(userId);
  },

  getOrCreate(userId: string, name: string, color?: string): TagRow {
    const cleanName = name.trim().replace(/^#/, '');
    const existing = sqliteDb.prepare('SELECT * FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(userId, cleanName);
    if (existing) return existing;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    sqliteDb.prepare(`
      INSERT INTO tags (id, user_id, name, color, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, cleanName, color || '#3b82f6', now);

    return sqliteDb.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  },

  delete(id: string, userId: string): boolean {
    const res = sqliteDb.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').run(id, userId);
    return res.changes > 0;
  },
};
