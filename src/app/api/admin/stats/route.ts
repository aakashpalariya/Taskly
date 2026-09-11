import { getAdminSession } from '@/lib/adminSession';
import { adminDb, initServerDb } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initServerDb();
    const session = await getAdminSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let stats;
    try {
      stats = await adminDb.getSystemAnalytics();
    } catch (dbErr) {
      console.error('Admin stats DB error:', dbErr);
      stats = {
        totalUsers: 0,
        activeUsers: 0,
        deactivatedUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        totalProjects: 0,
        totalFocusMinutes: 0,
        newUsersLast7Days: 0,
      };
    }

    return Response.json({ success: true, stats });
  } catch (err) {
    console.error('Admin get stats error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
