import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { tasksDb } from '@/server/db/tasks';
import { initServerDb } from '@/server/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const task = await tasksDb.restore(id, session.userId);

    if (!task) {
      return Response.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return Response.json({ success: true, task });
  } catch (err) {
    console.error('Restore task error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
