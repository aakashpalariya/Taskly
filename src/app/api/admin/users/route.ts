import { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { adminDb, initServerDb } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getAdminSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as 'all' | 'active' | 'deactivated') || 'all';

    let users: any[] = [];
    try {
      users = await adminDb.getAllUsers({ search, status });
    } catch (dbErr) {
      console.error('Admin get users DB error:', dbErr);
      return Response.json({ success: true, users: [] });
    }

    return Response.json({ success: true, users });
  } catch (err) {
    console.error('Admin get users error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
