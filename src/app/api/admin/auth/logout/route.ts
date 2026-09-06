import { clearAdminSessionCookieHeader } from '@/lib/adminSession';

export async function POST() {
  const cookieHeader = clearAdminSessionCookieHeader();
  return new Response(
    JSON.stringify({ success: true, message: 'Logged out of admin session' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
      },
    }
  );
}
