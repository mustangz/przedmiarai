import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ten email jest już na liście' },
        { status: 400 }
      );
    }

    // Insert new email
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email }]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd zapisu do bazy' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
