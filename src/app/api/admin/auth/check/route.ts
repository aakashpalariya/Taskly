import { getAdminSession } from '@/lib/adminSession';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ success: false, authenticated: false }, { status: 401 });
  }

  return Response.json({
    success: true,
    authenticated: true,
    role: session.role,
    authAt: session.authAt,
  });
}
