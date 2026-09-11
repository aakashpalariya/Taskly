import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { projectsDb } from '@/server/db/projects';
import { initServerDb } from '@/server/db';

export async function GET() {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const projects = await projectsDb.getByUser(session.userId);
    return Response.json({ success: true, projects });
  } catch (err) {
    console.error('Get projects error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const name = (body.name || '').trim();
    if (!name) return Response.json({ success: false, error: 'Project name required' }, { status: 400 });

    const project = await projectsDb.create({
      userId: session.userId,
      name,
      color: body.color || '#6366f1',
      icon: body.icon || '📁',
      isFavorite: Boolean(body.isFavorite),
    });

    return Response.json({ success: true, project }, { status: 201 });
  } catch (err) {
    console.error('Create project error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
