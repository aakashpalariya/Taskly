import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { initServerDb } from '@/server/db';
import { usersDb } from '@/server/db/users';
import { createSessionCookieHeader } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Always initialise the DB (creates tables + seed on first boot)
    await initServerDb();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const email = ((body?.email || body?.identifier || '') as string).trim().toLowerCase();
    const password = (body?.password || '') as string;

    if (!email || !password) {
      return Response.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user;
    try {
      user = usersDb.getByEmail(email);
    } catch (dbErr) {
      console.error('Login DB lookup error:', dbErr);
      return Response.json(
        { success: false, error: 'Database error. Please try again.' },
        { status: 503 }
      );
    }

    if (!user) {
      return Response.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    let valid = false;
    try {
      valid = await bcrypt.compare(password, user.password_hash);
    } catch (bcryptErr) {
      console.error('bcrypt.compare error:', bcryptErr);
      return Response.json(
        { success: false, error: 'Authentication error. Please try again.' },
        { status: 500 }
      );
    }

    if (!valid) {
      return Response.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.is_active === 0) {
      return Response.json(
        {
          success: false,
          error: 'Your account has been deactivated by an administrator. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Update last active timestamp (non-critical, don't throw)
    try {
      usersDb.update(user.id, { last_active_at: new Date().toISOString() });
    } catch {
      // Ignore non-critical update failures
    }

    const sessionCookie = createSessionCookieHeader({ userId: user.id });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          avatar: user.avatar,
          themePreference: user.theme_preference,
          soundEnabled: user.sound_enabled === 1,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': sessionCookie,
        },
      }
    );
  } catch (err) {
    console.error('Login unexpected error:', err);
    return Response.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
