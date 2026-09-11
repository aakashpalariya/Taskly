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
    const task = await tasksDb.getById(id);
    if (!task || task.user_id !== session.userId) {
      return Response.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();
    const title = (body.title || '').trim();
    if (!title) return Response.json({ success: false, error: 'Subtask title required' }, { status: 400 });

    const subtask = await tasksDb.addSubtask(id, title);
    return Response.json({ success: true, subtask }, { status: 201 });
  } catch (err) {
    console.error('Add subtask error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const task = await tasksDb.getById(id);
    if (!task || task.user_id !== session.userId) {
      return Response.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();
    const { subtaskId } = body;
    if (!subtaskId) return Response.json({ success: false, error: 'Subtask ID required' }, { status: 400 });

    const updated = await tasksDb.toggleSubtask(subtaskId);
    return Response.json({ success: true, subtask: updated });
  } catch (err) {
    console.error('Toggle subtask error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const task = await tasksDb.getById(id);
    if (!task || task.user_id !== session.userId) {
      return Response.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();
    const { subtaskId } = body;
    if (!subtaskId) return Response.json({ success: false, error: 'Subtask ID required' }, { status: 400 });

    const ok = await tasksDb.deleteSubtask(subtaskId);
    return Response.json({ success: ok });
  } catch (err) {
    console.error('Delete subtask error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
