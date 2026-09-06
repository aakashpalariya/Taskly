import { sqliteDb } from './connection';
import crypto from 'crypto';
import { TagRow } from './tags';

export interface SubtaskRow {
  id: string;
  task_id: string;
  title: string;
  is_completed: number;
  position: number;
  created_at: string;
}

export interface TaskRow {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name?: string | null;
  project_color?: string | null;
  project_icon?: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  due_date: string | null;
  due_time: string | null;
  reminder_at: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  is_completed: number;
  completed_at: string | null;
  position: number;
  is_recurring: number;
  recurrence_rule: string | null; // JSON: { frequency: 'daily'|'weekly'|'monthly', interval: number, daysOfWeek?: number[] }
  parent_task_id: string | null;
  estimated_minutes: number;
  actual_minutes: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  subtasks?: SubtaskRow[];
  tags?: TagRow[];
}

export const tasksDb = {
  getById(id: string): TaskRow | undefined {
    const task: TaskRow | undefined = sqliteDb.prepare(`
      SELECT t.*, p.name as project_name, p.color as project_color, p.icon as project_icon
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `).get(id);

    if (!task) return undefined;
    task.subtasks = sqliteDb.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position ASC, created_at ASC').all(id);
    task.tags = sqliteDb.prepare(`
      SELECT tg.* FROM tags tg
      JOIN task_tags tt ON tg.id = tt.tag_id
      WHERE tt.task_id = ?
    `).all(id);
    return task;
  },

  getAll(userId: string, options?: {
    projectId?: string | null; // null for Inbox (explicit null), or string
    view?: 'inbox' | 'today' | 'upcoming' | 'completed' | 'all';
    search?: string;
    priority?: string;
    tagId?: string;
    includeCompleted?: boolean;
  }): TaskRow[] {
    let sql = `
      SELECT t.*, p.name as project_name, p.color as project_color, p.icon as project_icon
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ? AND t.is_deleted = 0
    `;
    const params: any[] = [userId];

    if (options?.view === 'inbox') {
      sql += ' AND t.project_id IS NULL AND t.is_completed = 0';
    } else if (options?.view === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      sql += ' AND t.due_date <= ? AND t.is_completed = 0';
      params.push(todayStr);
    } else if (options?.view === 'upcoming') {
      const todayStr = new Date().toISOString().split('T')[0];
      sql += ' AND (t.due_date > ? OR t.due_date IS NOT NULL) AND t.is_completed = 0';
      params.push(todayStr);
    } else if (options?.view === 'completed') {
      sql += ' AND t.is_completed = 1';
    } else if (!options?.includeCompleted) {
      sql += ' AND t.is_completed = 0';
    }

    if (options?.projectId !== undefined) {
      if (options.projectId === null) {
        sql += ' AND t.project_id IS NULL';
      } else {
        sql += ' AND t.project_id = ?';
        params.push(options.projectId);
      }
    }

    if (options?.priority && options.priority !== 'ALL') {
      sql += ' AND t.priority = ?';
      params.push(options.priority);
    }

    if (options?.search) {
      sql += ' AND (t.title LIKE ? OR t.notes LIKE ? OR t.description LIKE ?)';
      const term = `%${options.search}%`;
      params.push(term, term, term);
    }

    if (options?.tagId) {
      sql += ' AND t.id IN (SELECT task_id FROM task_tags WHERE tag_id = ?)';
      params.push(options.tagId);
    }

    sql += ' ORDER BY t.is_completed ASC, t.position ASC, t.due_date ASC, t.created_at DESC';

    const tasks: TaskRow[] = sqliteDb.prepare(sql).all(...params);

    // Fetch subtasks and tags in batches for optimal performance
    if (tasks.length > 0) {
      const taskIds = tasks.map(t => t.id);
      const placeholders = taskIds.map(() => '?').join(',');

      const allSubtasks: SubtaskRow[] = sqliteDb.prepare(
        `SELECT * FROM subtasks WHERE task_id IN (${placeholders}) ORDER BY position ASC`
      ).all(...taskIds);

      const allTags: (TagRow & { task_id: string })[] = sqliteDb.prepare(
        `SELECT tg.*, tt.task_id 
         FROM tags tg 
         JOIN task_tags tt ON tg.id = tt.tag_id 
         WHERE tt.task_id IN (${placeholders})`
      ).all(...taskIds);

      const subtasksByTask = new Map<string, SubtaskRow[]>();
      for (const s of allSubtasks) {
        if (!subtasksByTask.has(s.task_id)) subtasksByTask.set(s.task_id, []);
        subtasksByTask.get(s.task_id)!.push(s);
      }

      const tagsByTask = new Map<string, TagRow[]>();
      for (const t of allTags) {
        if (!tagsByTask.has(t.task_id)) tagsByTask.set(t.task_id, []);
        tagsByTask.get(t.task_id)!.push(t);
      }

      for (const task of tasks) {
        task.subtasks = subtasksByTask.get(task.id) || [];
        task.tags = tagsByTask.get(task.id) || [];
      }
    }

    return tasks;
  },

  create(data: {
    userId: string;
    projectId?: string | null;
    title: string;
    description?: string | null;
    notes?: string | null;
    dueDate?: string | null;
    dueTime?: string | null;
    reminderAt?: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    isRecurring?: boolean;
    recurrenceRule?: string | null;
    estimatedMinutes?: number;
    subtasks?: string[];
    tagIds?: string[];
  }): TaskRow {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const maxPos = sqliteDb.prepare(
      'SELECT MAX(position) as maxPos FROM tasks WHERE user_id = ? AND is_deleted = 0'
    ).get(data.userId);
    const position = (maxPos?.maxPos ?? -1) + 1;

    return sqliteDb.transaction(() => {
      sqliteDb.prepare(`
        INSERT INTO tasks (
          id, user_id, project_id, title, description, notes, 
          due_date, due_time, reminder_at, priority, status, 
          is_completed, completed_at, position, is_recurring, 
          recurrence_rule, estimated_minutes, actual_minutes, 
          is_deleted, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, 
          ?, ?, ?, ?, ?, 
          0, NULL, ?, ?, 
          ?, ?, 0, 
          0, ?, ?
        )
      `).run(
        id,
        data.userId,
        data.projectId || null,
        data.title.trim(),
        data.description || null,
        data.notes || null,
        data.dueDate || null,
        data.dueTime || null,
        data.reminderAt || null,
        data.priority || 'NONE',
        data.status || 'TODO',
        position,
        data.isRecurring ? 1 : 0,
        data.recurrenceRule || null,
        data.estimatedMinutes || 0,
        now,
        now
      );

      // Insert subtasks if provided
      if (data.subtasks && data.subtasks.length > 0) {
        const insertSubtask = sqliteDb.prepare(`
          INSERT INTO subtasks (id, task_id, title, is_completed, position, created_at)
          VALUES (?, ?, ?, 0, ?, ?)
        `);
        data.subtasks.forEach((subTitle, idx) => {
          if (subTitle.trim()) {
            insertSubtask.run(crypto.randomUUID(), id, subTitle.trim(), idx, now);
          }
        });
      }

      // Link tags if provided
      if (data.tagIds && data.tagIds.length > 0) {
        const insertTag = sqliteDb.prepare(`
          INSERT OR IGNORE INTO task_tags (id, task_id, tag_id)
          VALUES (?, ?, ?)
        `);
        for (const tagId of data.tagIds) {
          insertTag.run(crypto.randomUUID(), id, tagId);
        }
      }

      // Log activity
      sqliteDb.prepare(`
        INSERT INTO activity_logs (id, user_id, task_id, action, details, created_at)
        VALUES (?, ?, ?, 'CREATE_TASK', ?, ?)
      `).run(crypto.randomUUID(), data.userId, id, `Created task "${data.title.trim()}"`, now);

      return this.getById(id)!;
    })();
  },

  update(id: string, userId: string, fields: Partial<{
    projectId: string | null;
    title: string;
    description: string | null;
    notes: string | null;
    dueDate: string | null;
    dueTime: string | null;
    reminderAt: string | null;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    isCompleted: boolean;
    position: number;
    isRecurring: boolean;
    recurrenceRule: string | null;
    estimatedMinutes: number;
    actualMinutes: number;
    isDeleted: boolean;
  }>): TaskRow | undefined {
    const existing = this.getById(id);
    if (!existing || existing.user_id !== userId) return undefined;

    const sets: string[] = [];
    const values: any[] = [];

    const fieldMap: Record<string, string> = {
      projectId: 'project_id',
      title: 'title',
      description: 'description',
      notes: 'notes',
      dueDate: 'due_date',
      dueTime: 'due_time',
      reminderAt: 'reminder_at',
      priority: 'priority',
      status: 'status',
      position: 'position',
      recurrenceRule: 'recurrence_rule',
      estimatedMinutes: 'estimated_minutes',
      actualMinutes: 'actual_minutes',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if ((fields as any)[key] !== undefined) {
        sets.push(`${col} = ?`);
        values.push((fields as any)[key]);
      }
    }

    if (fields.isRecurring !== undefined) {
      sets.push('is_recurring = ?');
      values.push(fields.isRecurring ? 1 : 0);
    }

    if (fields.isDeleted !== undefined) {
      sets.push('is_deleted = ?');
      values.push(fields.isDeleted ? 1 : 0);
    }

    if (fields.isCompleted !== undefined) {
      sets.push('is_completed = ?');
      values.push(fields.isCompleted ? 1 : 0);
      sets.push('completed_at = ?');
      values.push(fields.isCompleted ? new Date().toISOString() : null);
      if (fields.isCompleted && fields.status === undefined) {
        sets.push('status = ?');
        values.push('DONE');
      } else if (!fields.isCompleted && existing.status === 'DONE' && fields.status === undefined) {
        sets.push('status = ?');
        values.push('TODO');
      }
    }

    if (sets.length === 0) return existing;

    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    sqliteDb.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...values);

    // If recurring task was just completed, generate next occurrence
    if (fields.isCompleted && existing.is_recurring && existing.recurrence_rule) {
      this.handleRecurringRollover(existing);
    }

    return this.getById(id);
  },

  handleRecurringRollover(task: TaskRow): void {
    try {
      const rule = JSON.parse(task.recurrence_rule || '{}');
      const baseDate = task.due_date ? new Date(task.due_date) : new Date();
      let nextDate = new Date(baseDate);

      const interval = rule.interval || 1;
      if (rule.frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + interval);
      } else if (rule.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7 * interval);
      } else if (rule.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + interval);
      } else {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      const nextDueDate = nextDate.toISOString().split('T')[0];

      // Clone task for next occurrence
      this.create({
        userId: task.user_id,
        projectId: task.project_id,
        title: task.title,
        description: task.description,
        notes: task.notes,
        dueDate: nextDueDate,
        dueTime: task.due_time,
        priority: task.priority,
        isRecurring: true,
        recurrenceRule: task.recurrence_rule,
        estimatedMinutes: task.estimated_minutes,
        subtasks: task.subtasks?.map(s => s.title) || [],
      });
    } catch (err) {
      console.error('Error rolling over recurring task:', err);
    }
  },

  delete(id: string, userId: string): boolean {
    const res = sqliteDb.prepare('UPDATE tasks SET is_deleted = 1, updated_at = ? WHERE id = ? AND user_id = ?')
      .run(new Date().toISOString(), id, userId);
    return res.changes > 0;
  },

  restore(id: string, userId: string): TaskRow | undefined {
    sqliteDb.prepare('UPDATE tasks SET is_deleted = 0, updated_at = ? WHERE id = ? AND user_id = ?')
      .run(new Date().toISOString(), id, userId);
    return this.getById(id);
  },

  reorder(userId: string, orderedIds: string[]): void {
    const updateStmt = sqliteDb.prepare('UPDATE tasks SET position = ? WHERE id = ? AND user_id = ?');
    sqliteDb.transaction(() => {
      orderedIds.forEach((id, index) => {
        updateStmt.run(index, id, userId);
      });
    })();
  },

  // Subtask helpers
  addSubtask(taskId: string, title: string): SubtaskRow {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const maxPos = sqliteDb.prepare('SELECT MAX(position) as maxPos FROM subtasks WHERE task_id = ?').get(taskId);
    const position = (maxPos?.maxPos ?? -1) + 1;

    sqliteDb.prepare(`
      INSERT INTO subtasks (id, task_id, title, is_completed, position, created_at)
      VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, taskId, title.trim(), position, now);

    return sqliteDb.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
  },

  toggleSubtask(subtaskId: string): SubtaskRow | undefined {
    const current = sqliteDb.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtaskId);
    if (!current) return undefined;
    const nextVal = current.is_completed === 1 ? 0 : 1;
    sqliteDb.prepare('UPDATE subtasks SET is_completed = ? WHERE id = ?').run(nextVal, subtaskId);
    return sqliteDb.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtaskId);
  },

  deleteSubtask(subtaskId: string): boolean {
    const res = sqliteDb.prepare('DELETE FROM subtasks WHERE id = ?').run(subtaskId);
    return res.changes > 0;
  },

  // Tag helper
  toggleTaskTag(taskId: string, tagId: string): void {
    const existing = sqliteDb.prepare('SELECT * FROM task_tags WHERE task_id = ? AND tag_id = ?').get(taskId, tagId);
    if (existing) {
      sqliteDb.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?').run(taskId, tagId);
    } else {
      sqliteDb.prepare('INSERT INTO task_tags (id, task_id, tag_id) VALUES (?, ?, ?)').run(crypto.randomUUID(), taskId, tagId);
    }
  },
};
