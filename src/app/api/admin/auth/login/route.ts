import { NextRequest } from 'next/server';
import { adminDb, initServerDb } from '@/server/db';
import { createAdminSessionCookieHeader } from '@/lib/adminSession';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    try {
      await initServerDb();
    } catch (dbInitErr) {
      console.error('Admin login DB init warning:', dbInitErr);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: 'Invalid JSON request body' }, { status: 400 });
    }

    const password = body?.password;
    if (!password) {
      return Response.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    let isValid = false;
    const envAdminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (envAdminPassword) {
      // Whatever password is set in .env, admin login will use that password
      isValid = password === envAdminPassword;
    } else {
      try {
        isValid = await adminDb.verifyAdminPassword(password);
      } catch (verifyErr) {
        console.error('adminDb.verifyAdminPassword error:', verifyErr);
        // If error occurs and no env password, fallback to master default password
        isValid = password === 'Admin@Taskly2025';
      }
    }

    if (!isValid) {
      return Response.json({ success: false, error: 'Incorrect admin password' }, { status: 401 });
    }

    let cookieHeader: string;
    try {
      cookieHeader = createAdminSessionCookieHeader();
    } catch (cookieErr) {
      console.error('createAdminSessionCookieHeader error:', cookieErr);
      return Response.json({ success: false, error: 'Failed to create admin session' }, { status: 500 });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Admin authenticated successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (err) {
    console.error('Admin login unexpected error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
