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
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);

    let activities: any[] = [];
    try {
      activities = adminDb.getRecentSystemActivity(limit);
    } catch (dbErr) {
      console.error('Admin activity DB error:', dbErr);
      // Return empty array instead of 500 — the table may not exist yet on fresh DB
      return Response.json({ success: true, activities: [] });
    }

    return Response.json({ success: true, activities });
  } catch (err) {
    console.error('Admin get activity error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
