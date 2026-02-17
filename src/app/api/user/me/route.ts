import { NextRequest, NextResponse } from 'next/server';
import { validateUserToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await validateUserToken(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    plan: user.plan,
    credits_remaining: user.credits_remaining,
    created_at: user.created_at,
  });
}
