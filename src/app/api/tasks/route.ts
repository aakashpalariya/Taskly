import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { tasksDb } from '@/server/db/tasks';
import { projectsDb } from '@/server/db/projects';
import { tagsDb } from '@/server/db/tags';
import { initServerDb } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') as any || undefined;
    const rawProjectId = searchParams.get('projectId');
    const search = searchParams.get('search') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const tagId = searchParams.get('tagId') || undefined;
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    let projectId: string | null | undefined = undefined;
    if (rawProjectId === 'inbox' || rawProjectId === 'null') {
      projectId = null;
    } else if (rawProjectId) {
      projectId = rawProjectId;
    }

    const tasks = tasksDb.getAll(session.userId, {
      view,
      projectId,
      search,
      priority,
      tagId,
      includeCompleted,
    });

    return Response.json({ success: true, tasks });
  } catch (err) {
    console.error('Fetch tasks error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const title = (body.title || '').trim();

    if (!title) {
      return Response.json({ success: false, error: 'Task title is required' }, { status: 400 });
    }

    let resolvedProjectId = body.projectId || null;
    if (body.projectName && !resolvedProjectId) {
      // Find or create project if projectName supplied via NLP
      const existingProjects = projectsDb.getByUser(session.userId);
      const matched = existingProjects.find(
        p => p.name.toLowerCase() === body.projectName.toLowerCase()
      );
      if (matched) {
        resolvedProjectId = matched.id;
      } else {
        const newProj = projectsDb.create({
          userId: session.userId,
          name: body.projectName,
          color: '#6366f1',
        });
        resolvedProjectId = newProj.id;
      }
    }

    const tagIds: string[] = body.tagIds || [];
    if (body.tags && Array.isArray(body.tags)) {
      for (const tName of body.tags) {
        if (typeof tName === 'string' && tName.trim()) {
          const t = tagsDb.getOrCreate(session.userId, tName.trim());
          if (!tagIds.includes(t.id)) tagIds.push(t.id);
        }
      }
    }

    const task = tasksDb.create({
      userId: session.userId,
      projectId: resolvedProjectId,
      title,
      description: body.description || null,
      notes: body.notes || null,
      dueDate: body.dueDate || null,
      dueTime: body.dueTime || null,
      reminderAt: body.reminderAt || null,
      priority: body.priority || 'NONE',
      status: body.status || 'TODO',
      isRecurring: Boolean(body.isRecurring),
      recurrenceRule: body.recurrenceRule ? (typeof body.recurrenceRule === 'string' ? body.recurrenceRule : JSON.stringify(body.recurrenceRule)) : null,
      estimatedMinutes: body.estimatedMinutes ? Number(body.estimatedMinutes) : 0,
      subtasks: body.subtasks || [],
      tagIds,
    });

    return Response.json({ success: true, task }, { status: 201 });
  } catch (err) {
    console.error('Create task error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
