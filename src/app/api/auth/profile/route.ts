import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { usersDb } from '@/server/db/users';
import { sqliteDb } from '@/server/db/connection';
import { initServerDb } from '@/server/db';

export async function GET() {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = usersDb.getById(session.userId);
    if (!user) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Additional quick stats for profile
    const taskStats = sqliteDb.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
      FROM tasks 
      WHERE user_id = ? AND is_deleted = 0
    `).get(session.userId);

    const projectCount = sqliteDb.prepare(`
      SELECT COUNT(*) as count FROM projects WHERE user_id = ?
    `).get(session.userId)?.count || 0;

    return Response.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatar: user.avatar,
        themePreference: user.theme_preference,
        soundEnabled: user.sound_enabled === 1,
        createdAt: user.created_at,
        stats: {
          totalTasks: taskStats?.total || 0,
          completedTasks: taskStats?.completed || 0,
          projectsCount: projectCount,
        },
      },
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await initServerDb();
    const session = await getSession();
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = usersDb.getById(session.userId);
    if (!user) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const updateFields: any = {};

    if (body.fullName !== undefined) {
      if (!body.fullName.trim()) {
        return Response.json({ success: false, error: 'Full name cannot be empty' }, { status: 400 });
      }
      updateFields.full_name = body.fullName.trim();
    }

    if (body.themePreference !== undefined) {
      if (['light', 'dark', 'system'].includes(body.themePreference)) {
        updateFields.theme_preference = body.themePreference;
      }
    }

    if (body.soundEnabled !== undefined) {
      updateFields.sound_enabled = body.soundEnabled ? 1 : 0;
    }

    // Password change handling
    if (body.newPassword) {
      if (!body.currentPassword) {
        return Response.json({ success: false, error: 'Current password is required to set a new password' }, { status: 400 });
      }

      const valid = await bcrypt.compare(body.currentPassword, user.password_hash);
      if (!valid) {
        return Response.json({ success: false, error: 'Incorrect current password' }, { status: 400 });
      }

      if (body.newPassword.length < 6) {
        return Response.json({ success: false, error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(body.newPassword, 10);
      updateFields.password_hash = newHash;
    }

    const updatedUser = usersDb.update(user.id, updateFields);
    if (!updatedUser) {
      return Response.json({ success: false, error: 'Failed to update user' }, { status: 500 });
    }

    return Response.json({
      success: true,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        themePreference: updatedUser.theme_preference,
        soundEnabled: updatedUser.sound_enabled === 1,
      },
    });
  } catch (err) {
    console.error('Profile PATCH error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
