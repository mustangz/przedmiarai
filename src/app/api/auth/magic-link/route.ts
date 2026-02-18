import { NextRequest, NextResponse } from 'next/server';
import { createMagicLink } from '@/lib/auth';
import { sendMagicLinkEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, redirect } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Podaj poprawny email' }, { status: 400 });
    }

    const token = await createMagicLink(email);
    await sendMagicLinkEmail(email, token, redirect);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Magic link error:', err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
