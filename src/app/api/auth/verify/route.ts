import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Brak tokenu' }, { status: 400 });
  }

  const result = await verifyMagicLink(token);

  if (!result) {
    return NextResponse.json({ error: 'Link wygasł lub jest nieprawidłowy' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: result.user.id,
      email: result.user.email,
      plan: result.user.plan,
      credits_remaining: result.user.credits_remaining,
    },
    token: result.sessionToken,
  });
}
