import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { tasksDb } from '@/server/db/tasks';
import { initServerDb } from '@/server/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const task = tasksDb.getById(id);

    if (!task || task.user_id !== session.userId || task.is_deleted === 1) {
      return Response.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return Response.json({ success: true, task });
  } catch (err) {
    console.error('Get task error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const updated = tasksDb.update(id, session.userId, {
      projectId: body.projectId !== undefined ? body.projectId : undefined,
      title: body.title !== undefined ? body.title : undefined,
      description: body.description !== undefined ? body.description : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      dueDate: body.dueDate !== undefined ? body.dueDate : undefined,
      dueTime: body.dueTime !== undefined ? body.dueTime : undefined,
      reminderAt: body.reminderAt !== undefined ? body.reminderAt : undefined,
      priority: body.priority !== undefined ? body.priority : undefined,
      status: body.status !== undefined ? body.status : undefined,
      isCompleted: body.isCompleted !== undefined ? Boolean(body.isCompleted) : undefined,
      position: body.position !== undefined ? Number(body.position) : undefined,
      isRecurring: body.isRecurring !== undefined ? Boolean(body.isRecurring) : undefined,
      recurrenceRule: body.recurrenceRule ? (typeof body.recurrenceRule === 'string' ? body.recurrenceRule : JSON.stringify(body.recurrenceRule)) : undefined,
      estimatedMinutes: body.estimatedMinutes !== undefined ? Number(body.estimatedMinutes) : undefined,
      actualMinutes: body.actualMinutes !== undefined ? Number(body.actualMinutes) : undefined,
    });

    if (!updated) {
      return Response.json({ success: false, error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return Response.json({ success: true, task: updated });
  } catch (err) {
    console.error('Update task error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const ok = tasksDb.delete(id, session.userId);

    if (!ok) {
      return Response.json({ success: false, error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Delete task error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
