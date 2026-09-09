import bcrypt from 'bcryptjs';
import { sqliteDb } from './connection';
import { usersDb } from './users';
import { projectsDb } from './projects';
import { tagsDb } from './tags';
import { tasksDb } from './tasks';

export async function seedDatabaseIfEmpty(): Promise<void> {
  // Ensure default admin password exists
  try {
    const adminPassSetting = sqliteDb.prepare("SELECT value FROM system_settings WHERE key = 'admin_password_hash'").get();
    if (!adminPassSetting) {
      const adminHash = await bcrypt.hash('Admin@Taskly2025', 10);
      sqliteDb.prepare("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('admin_password_hash', ?, ?)").run(
        adminHash,
        new Date().toISOString()
      );
    }
  } catch (err) {
    console.error('Error seeding admin password:', err);
  }

  // Check if demo user already exists with DOB setup
  const demoUser = sqliteDb.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get('demo@taskly.app');
  if (demoUser && demoUser.dob === '2001-01-01') {
    return; // Already initialized with fresh default data
  }

  // Clear existing data to ensure only fresh default data remains
  try {
    sqliteDb.prepare('DELETE FROM subtasks').run();
    sqliteDb.prepare('DELETE FROM task_tags').run();
    sqliteDb.prepare('DELETE FROM tasks').run();
    sqliteDb.prepare('DELETE FROM tags').run();
    sqliteDb.prepare('DELETE FROM projects').run();
    sqliteDb.prepare('DELETE FROM pomodoro_sessions').run();
    sqliteDb.prepare('DELETE FROM activity_logs').run();
    sqliteDb.prepare('DELETE FROM notifications').run();
    sqliteDb.prepare('DELETE FROM users').run();
  } catch (err) {
    console.error('Error wiping database tables:', err);
  }

  const passwordHash = await bcrypt.hash('Demo@123', 10);
  const user = usersDb.create({
    fullName: 'Demo User',
    email: 'demo@taskly.app',
    passwordHash,
    dob: '2001-01-01',
  });

  // Projects
  const workProject = projectsDb.create({
    userId: user.id,
    name: 'Work & Projects',
    color: '#3b82f6',
    icon: '💼',
    isFavorite: true,
  });

  const personalProject = projectsDb.create({
    userId: user.id,
    name: 'Personal & Home',
    color: '#10b981',
    icon: '🏠',
    isFavorite: true,
  });

  const healthProject = projectsDb.create({
    userId: user.id,
    name: 'Health & Fitness',
    color: '#f59e0b',
    icon: '⚡',
    isFavorite: false,
  });

  // Tags
  const urgentTag = tagsDb.getOrCreate(user.id, 'urgent', '#ef4444');
  const reviewTag = tagsDb.getOrCreate(user.id, 'review', '#8b5cf6');
  const quickTag = tagsDb.getOrCreate(user.id, 'quick-win', '#06b6d4');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Tasks
  tasksDb.create({
    userId: user.id,
    projectId: workProject.id,
    title: 'Review quarterly product roadmap and OKRs',
    description: 'Go through the Q3 deliverables with the engineering and design leads.',
    notes: 'Remember to check hiring budget and mobile app release timeline.',
    dueDate: todayStr,
    dueTime: '14:30',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    estimatedMinutes: 45,
    subtasks: [
      'Summarize key KPIs',
      'Align on sprint goals with team',
      'Send recap to stakeholders',
    ],
    tagIds: [urgentTag.id, reviewTag.id],
  });

  tasksDb.create({
    userId: user.id,
    projectId: workProject.id,
    title: 'Try natural language quick-add (Press Q or click +)',
    notes: 'Type something like: "Submit invoice tomorrow at 5pm !high #work"',
    dueDate: todayStr,
    priority: 'MEDIUM',
    status: 'TODO',
    estimatedMinutes: 10,
    tagIds: [quickTag.id],
  });

  tasksDb.create({
    userId: user.id,
    projectId: healthProject.id,
    title: '30-minute cardio and core workout',
    notes: 'Interval training: 5m warm-up, 20m HIIT, 5m stretch.',
    dueDate: todayStr,
    dueTime: '07:30',
    priority: 'MEDIUM',
    status: 'TODO',
    isRecurring: true,
    recurrenceRule: JSON.stringify({ frequency: 'daily', interval: 1 }),
    estimatedMinutes: 30,
  });

  tasksDb.create({
    userId: user.id,
    projectId: personalProject.id,
    title: 'Weekly grocery restock and meal planning',
    dueDate: tomorrowStr,
    priority: 'LOW',
    status: 'TODO',
    isRecurring: true,
    recurrenceRule: JSON.stringify({ frequency: 'weekly', interval: 1 }),
    subtasks: ['Fresh vegetables', 'Greek yogurt', 'Cold brew coffee beans'],
  });

  tasksDb.create({
    userId: user.id,
    projectId: null, // Inbox task
    title: 'Explore Focus Mode with Pomodoro timer',
    notes: 'Use the integrated Pomodoro timer to maintain deep focus with audio alerts.',
    priority: 'LOW',
    status: 'TODO',
    estimatedMinutes: 25,
  });
}
