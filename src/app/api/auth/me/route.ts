import { getSession } from '@/lib/session';
import { usersDb } from '@/server/db/users';
import { initServerDb } from '@/server/db';

export async function GET() {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await usersDb.getById(session.userId);
    if (!user || user.is_active === 0) {
      return Response.json({ success: false, error: 'User not found or deactivated' }, { status: 401 });
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatar: user.avatar,
        themePreference: user.theme_preference,
        soundEnabled: user.sound_enabled === 1,
      },
    });
  } catch (err) {
    console.error('Auth /me error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
