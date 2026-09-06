import { sqliteDb } from './connection';
import crypto from 'crypto';

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_favorite: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export const projectsDb = {
  getByUser(userId: string): ProjectRow[] {
    return sqliteDb.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? 
      ORDER BY position ASC, created_at ASC
    `).all(userId);
  },

  getById(id: string): ProjectRow | undefined {
    return sqliteDb.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  },

  create(data: {
    userId: string;
    name: string;
    color?: string;
    icon?: string;
    isFavorite?: boolean;
  }): ProjectRow {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const maxPos = sqliteDb.prepare(`
      SELECT MAX(position) as maxPos FROM projects WHERE user_id = ?
    `).get(data.userId);

    const position = (maxPos?.maxPos ?? -1) + 1;

    sqliteDb.prepare(`
      INSERT INTO projects (id, user_id, name, color, icon, is_favorite, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.userId,
      data.name.trim(),
      data.color || '#6366f1',
      data.icon || '📁',
      data.isFavorite ? 1 : 0,
      position,
      now,
      now
    );

    return this.getById(id)!;
  },

  update(id: string, data: Partial<{
    name: string;
    color: string;
    icon: string;
    is_favorite: number;
    position: number;
  }>): ProjectRow | undefined {
    const sets: string[] = [];
    const values: any[] = [];

    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        sets.push(`${k} = ?`);
        values.push(v);
      }
    }

    if (sets.length === 0) return this.getById(id);

    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    sqliteDb.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  delete(id: string): boolean {
    // When a project is deleted, set project_id to NULL on tasks rather than deleting user's tasks
    sqliteDb.prepare('UPDATE tasks SET project_id = NULL WHERE project_id = ?').run(id);
    const res = sqliteDb.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return res.changes > 0;
  },

  reorder(userId: string, orderedIds: string[]): void {
    const updateStmt = sqliteDb.prepare('UPDATE projects SET position = ? WHERE id = ? AND user_id = ?');
    sqliteDb.transaction(() => {
      orderedIds.forEach((id, index) => {
        updateStmt.run(index, id, userId);
      });
    })();
  },
};
