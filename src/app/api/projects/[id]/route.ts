import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { projectsDb } from '@/server/db/projects';
import { initServerDb } from '@/server/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const updated = await projectsDb.update(id, {
      name: body.name !== undefined ? body.name : undefined,
      color: body.color !== undefined ? body.color : undefined,
      icon: body.icon !== undefined ? body.icon : undefined,
      is_favorite: body.isFavorite !== undefined ? (body.isFavorite ? 1 : 0) : undefined,
    });

    return Response.json({ success: true, project: updated });
  } catch (err) {
    console.error('Update project error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = await projectsDb.getById(id);
    if (!project || project.user_id !== session.userId) {
      return Response.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const ok = await projectsDb.delete(id);
    return Response.json({ success: ok });
  } catch (err) {
    console.error('Delete project error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
