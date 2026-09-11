import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { usersDb } from '@/server/db/users';
import { initServerDb } from '@/server/db';

export const dynamic = 'force-dynamic';

function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  
  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Format: DD/MM/YYYY or MM/DD/YYYY or D/M/YYYY
  const parts = trimmed.split(/[\/\-\.]/);
  if (parts.length === 3) {
    let year = parts[2];
    let month = parts[0];
    let day = parts[1];
    
    // If year is first (YYYY/MM/DD)
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else if (parts[2].length === 4) {
      // If day is > 12, parts[0] is day, parts[1] is month
      if (parseInt(parts[0], 10) > 12) {
        day = parts[0];
        month = parts[1];
      }
    }
    
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    await initServerDb();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const email = ((body?.email || '') as string).trim().toLowerCase();
    const dob = ((body?.dob || '') as string).trim();
    const newPassword = (body?.newPassword || '') as string;

    if (!email || !dob || !newPassword) {
      return Response.json(
        { success: false, error: 'Email, Date of Birth, and New Password are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ success: false, error: 'Invalid email address format' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await usersDb.getByEmail(email);
    if (!user) {
      return Response.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    const normalizedStoredDob = normalizeDate(user.dob || '');
    const normalizedInputDob = normalizeDate(dob);

    if (!normalizedStoredDob || normalizedStoredDob !== normalizedInputDob) {
      return Response.json(
        { success: false, error: 'Date of birth does not match our records' },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await usersDb.update(user.id, { password_hash: newHash });

    return Response.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Forgot password API error:', err);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
