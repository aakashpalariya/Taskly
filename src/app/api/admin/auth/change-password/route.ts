import { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { adminDb, initServerDb } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getAdminSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json({ success: false, error: 'Current and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ success: false, error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const isValid = await adminDb.verifyAdminPassword(currentPassword);
    if (!isValid) {
      return Response.json({ success: false, error: 'Current admin password is incorrect' }, { status: 400 });
    }

    await adminDb.setAdminPassword(newPassword);

    return Response.json({ success: true, message: 'Admin password updated successfully' });
  } catch (err) {
    console.error('Change admin password error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
