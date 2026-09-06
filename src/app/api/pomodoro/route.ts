import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { pomodoroDb } from '@/server/db/pomodoro';
import { initServerDb } from '@/server/db';

export async function GET() {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const stats = pomodoroDb.getStats(session.userId);
    return Response.json({ success: true, stats });
  } catch (err) {
    console.error('Get pomodoro stats error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const durationMinutes = Number(body.durationMinutes) || 25;
    const sessionType = body.sessionType || 'FOCUS';
    const taskId = body.taskId || null;

    const pomodoro = pomodoroDb.logSession({
      userId: session.userId,
      taskId,
      durationMinutes,
      sessionType,
    });

    return Response.json({ success: true, pomodoro }, { status: 201 });
  } catch (err) {
    console.error('Log pomodoro error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
