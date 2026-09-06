import { sqliteDb } from './connection';
import crypto from 'crypto';

export interface PomodoroSessionRow {
  id: string;
  user_id: string;
  task_id: string | null;
  duration_minutes: number;
  session_type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  completed_at: string;
}

export const pomodoroDb = {
  logSession(data: {
    userId: string;
    taskId?: string | null;
    durationMinutes: number;
    sessionType?: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  }): PomodoroSessionRow {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    sqliteDb.prepare(`
      INSERT INTO pomodoro_sessions (id, user_id, task_id, duration_minutes, session_type, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.userId,
      data.taskId || null,
      data.durationMinutes,
      data.sessionType || 'FOCUS',
      now
    );

    // If linked to a task, update actual_minutes on task
    if (data.taskId && data.sessionType === 'FOCUS') {
      sqliteDb.prepare(`
        UPDATE tasks 
        SET actual_minutes = actual_minutes + ? 
        WHERE id = ? AND user_id = ?
      `).run(data.durationMinutes, data.taskId, data.userId);
    }

    return sqliteDb.prepare('SELECT * FROM pomodoro_sessions WHERE id = ?').get(id);
  },

  getStats(userId: string): {
    totalFocusMinutes: number;
    totalSessions: number;
    todayFocusMinutes: number;
    recentSessions: PomodoroSessionRow[];
  } {
    const todayPrefix = new Date().toISOString().split('T')[0];

    const total = sqliteDb.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as totalMin, COUNT(*) as count
      FROM pomodoro_sessions
      WHERE user_id = ? AND session_type = 'FOCUS'
    `).get(userId);

    const today = sqliteDb.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as todayMin
      FROM pomodoro_sessions
      WHERE user_id = ? AND session_type = 'FOCUS' AND completed_at LIKE ?
    `).get(userId, `${todayPrefix}%`);

    const recent = sqliteDb.prepare(`
      SELECT * FROM pomodoro_sessions
      WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT 10
    `).all(userId);

    return {
      totalFocusMinutes: total?.totalMin || 0,
      totalSessions: total?.count || 0,
      todayFocusMinutes: today?.todayMin || 0,
      recentSessions: recent || [],
    };
  },
};
