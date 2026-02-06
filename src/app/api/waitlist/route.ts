import { NextResponse } from 'next/server';

const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

export async function POST(request: Request) {
  try {
    const { email, variant } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email' },
        { status: 400 }
      );
    }

    if (!WEB3FORMS_KEY) {
      console.error('WEB3FORMS_ACCESS_KEY not configured');
      return NextResponse.json(
        { error: 'Serwer nie skonfigurowany' },
        { status: 500 }
      );
    }

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'Nowy lead — PrzedmiarAI waitlista',
        from_name: 'PrzedmiarAI',
        email,
        variant: variant || 'unknown',
      }),
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    }

    console.error('Web3Forms error:', data);
    return NextResponse.json(
      { error: 'Błąd zapisu' },
      { status: 500 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
