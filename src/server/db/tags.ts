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
  async getByUser(userId: string): Promise<TagRow[]> {
    return await sqliteDb.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC').all(userId);
  },

  async getOrCreate(userId: string, name: string, color?: string): Promise<TagRow> {
    const cleanName = name.trim().replace(/^#/, '');
    const existing = await sqliteDb.prepare('SELECT * FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(userId, cleanName);
    if (existing) return existing;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await sqliteDb.prepare(`
      INSERT INTO tags (id, user_id, name, color, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, cleanName, color || '#3b82f6', now);

    const created = await sqliteDb.prepare('SELECT * FROM tags WHERE id = ?').get(id);
    return created!;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const res = await sqliteDb.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').run(id, userId);
    return (res.changes || 0) > 0;
  },
};
