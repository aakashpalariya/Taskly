import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { tagsDb } from '@/server/db/tags';
import { initServerDb } from '@/server/db';

export async function GET() {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const tags = tagsDb.getByUser(session.userId);
    return Response.json({ success: true, tags });
  } catch (err) {
    console.error('Get tags error:', err);
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
    if (!name) return Response.json({ success: false, error: 'Tag name required' }, { status: 400 });

    const tag = tagsDb.getOrCreate(session.userId, name, body.color);
    return Response.json({ success: true, tag }, { status: 201 });
  } catch (err) {
    console.error('Create tag error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
