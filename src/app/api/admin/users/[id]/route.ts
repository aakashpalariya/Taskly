import { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { adminDb, initServerDb } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initServerDb();
    const session = await getAdminSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    let details;
    try {
      details = adminDb.getUserDetails(id);
    } catch (dbErr) {
      console.error('Admin get user details DB error:', dbErr);
      return Response.json({ success: false, error: 'Failed to load user details' }, { status: 503 });
    }

    if (!details) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, ...details });
  } catch (err) {
    console.error('Admin get user details error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initServerDb();
    const session = await getAdminSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    // Toggle active status
    if (typeof body.isActive === 'boolean') {
      const ok = adminDb.setUserActiveStatus(id, body.isActive);
      if (!ok) {
        return Response.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      return Response.json({
        success: true,
        message: `User successfully ${body.isActive ? 'activated' : 'deactivated'}`,
      });
    }

    // Reset password
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return Response.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const ok = await adminDb.resetUserPassword(id, body.newPassword);
      if (!ok) {
        return Response.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      return Response.json({
        success: true,
        message: 'User password reset successfully',
      });
    }

    return Response.json({ success: false, error: 'No valid action provided' }, { status: 400 });
  } catch (err) {
    console.error('Admin update user error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initServerDb();
    const session = await getAdminSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    let ok: boolean;
    try {
      ok = adminDb.deleteUser(id);
    } catch (dbErr) {
      console.error('Admin delete user DB error:', dbErr);
      return Response.json({ success: false, error: 'Failed to delete user' }, { status: 503 });
    }

    if (!ok) {
      return Response.json({ success: false, error: 'User not found or deletion failed' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'User permanently deleted' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
