import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'taskly-secret-session-key-randomize-in-prod';
const ADMIN_COOKIE_NAME = 'taskly_admin_session';
const MAX_AGE = 60 * 60 * 12; // 12 hours admin session

function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SECRET + '-admin-salt');
  hmac.update(payload);
  return hmac.digest('hex');
}

export interface AdminSessionPayload {
  role: 'admin';
  authAt: number;
}

export function encodeAdminSession(payload: AdminSessionPayload): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function decodeAdminSession(token: string): AdminSessionPayload | null {
  try {
    const [b64, sig] = token.split('.');
    if (!b64 || !sig) return null;
    if (sign(b64) !== sig) return null;
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as AdminSessionPayload;
    if (parsed.role !== 'admin') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeAdminSession(token);
}

export function createAdminSessionCookieHeader(payload: AdminSessionPayload = { role: 'admin', authAt: Date.now() }): string {
  const token = encodeAdminSession(payload);
  return `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearAdminSessionCookieHeader(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
