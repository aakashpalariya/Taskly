import { getSession } from '@/lib/session';
import { sqliteDb } from '@/server/db/connection';
import { initServerDb } from '@/server/db';

export async function GET() {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const userId = session.userId;

    // Total counts
    const counts = await sqliteDb.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) as pending
      FROM tasks 
      WHERE user_id = ? AND is_deleted = 0
    `).get(userId);

    // Completion by priority
    const priorityBreakdown = await sqliteDb.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? AND is_deleted = 0 
      GROUP BY priority
    `).all(userId);

    // Completion by project
    const projectBreakdown = await sqliteDb.prepare(`
      SELECT COALESCE(p.name, 'Inbox') as projectName, COALESCE(p.color, '#64748b') as color, COUNT(t.id) as count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ? AND t.is_deleted = 0
      GROUP BY t.project_id
    `).all(userId);

    // 7-day velocity
    const velocity7Days: { date: string; completed: number; created: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayCompleted = (await sqliteDb.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE user_id = ? AND is_completed = 1 AND completed_at LIKE ?
      `).get(userId, `${dateStr}%`))?.count || 0;

      const dayCreated = (await sqliteDb.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE user_id = ? AND created_at LIKE ?
      `).get(userId, `${dateStr}%`))?.count || 0;

      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      velocity7Days.push({ date: label, completed: Number(dayCompleted), created: Number(dayCreated) });
    }

    // Streak calculation (consecutive days with at least 1 completed task)
    let streak = 0;
    const checkDate = new Date();
    // If today has no completions yet, check yesterday to avoid breaking yesterday's streak
    const todayStr = checkDate.toISOString().split('T')[0];
    const todayDone = (await sqliteDb.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE user_id = ? AND is_completed = 1 AND completed_at LIKE ?
    `).get(userId, `${todayStr}%`))?.count || 0;

    if (todayDone > 0) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 30; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      const count = (await sqliteDb.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE user_id = ? AND is_completed = 1 AND completed_at LIKE ?
      `).get(userId, `${dStr}%`))?.count || 0;

      if (count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return Response.json({
      success: true,
      stats: {
        totalTasks: Number(counts?.total || 0),
        completedTasks: Number(counts?.completed || 0),
        pendingTasks: Number(counts?.pending || 0),
        completionRate: counts?.total ? Math.round(((counts.completed || 0) / counts.total) * 100) : 0,
        streak,
        priorityBreakdown,
        projectBreakdown,
        velocity7Days,
      },
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
