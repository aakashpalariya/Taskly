import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { usersDb } from '@/server/db/users';
import { projectsDb } from '@/server/db/projects';
import { tagsDb } from '@/server/db/tags';
import { tasksDb } from '@/server/db/tasks';
import { createSessionCookieHeader } from '@/lib/session';
import { initServerDb } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    await initServerDb();
    const body = await req.json();
    const fullName = (body.fullName || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password;

    if (!fullName || !email || !password) {
      return Response.json({ success: false, error: 'Full name, email, and password are required' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, error: 'Invalid email address format' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = usersDb.getByEmail(email);
    if (existing) {
      return Response.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = usersDb.create({
      fullName,
      email,
      passwordHash,
    });

    // Seed default starter projects & tags for the new user
    const workProj = projectsDb.create({ userId: user.id, name: 'Work', color: '#3b82f6', icon: '💼', isFavorite: true });
    projectsDb.create({ userId: user.id, name: 'Personal', color: '#10b981', icon: '🏠', isFavorite: true });
    const tag = tagsDb.getOrCreate(user.id, 'quick-win', '#06b6d4');

    // Create a welcome task
    tasksDb.create({
      userId: user.id,
      projectId: workProj.id,
      title: 'Welcome to Taskly! Click to view details & subtasks',
      notes: 'You can create tasks with natural language, drag & drop to reorder, and switch to Kanban or Calendar view anytime!',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'HIGH',
      status: 'TODO',
      subtasks: ['Check out Kanban view', 'Try Pomodoro focus mode', 'Add your first task'],
      tagIds: [tag.id],
    });

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
        status: 201,
        headers: { 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie },
      }
    );
  } catch (err) {
    console.error('Signup error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
