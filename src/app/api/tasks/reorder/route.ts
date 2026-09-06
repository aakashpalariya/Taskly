import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { tasksDb } from '@/server/db/tasks';
import { initServerDb } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { taskIds } = body;

    if (!Array.isArray(taskIds)) {
      return Response.json({ success: false, error: 'taskIds array required' }, { status: 400 });
    }

    tasksDb.reorder(session.userId, taskIds);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Reorder tasks error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
