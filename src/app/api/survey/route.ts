import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const row = {
      role: body.role || null,
      company_size: body.company_size || null,
      projects_per_year: body.projects_per_year || null,
      last_przedmiar: body.last_przedmiar || null,
      current_tool: body.current_tool || null,
      time_per_przedmiar: body.time_per_przedmiar || null,
      pain_point: body.pain_point || null,
      beta_useful: body.beta_useful || null,
      beta_limitation: body.beta_limitation || null,
      disappointment_score: body.disappointment_score || null,
      told_someone: body.told_someone === 'Tak',
      pricing_model: body.pricing_model || null,
      willing_to_pay: body.willing_to_pay || null,
      would_subscribe: body.would_subscribe || null,
      contact_email: body.contact_email || null,
    };

    const supabase = createServerSupabase();
    const { error } = await supabase.from('survey_responses').insert(row);

    if (error) {
      console.error('[Survey] Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    // Notify founder
    const score = row.disappointment_score;
    const pay = row.willing_to_pay;
    const subscribe = row.would_subscribe;

    await sendTelegramMessage(
      `📊 <b>Nowa ankieta!</b>\n\n` +
      `Rola: ${row.role}\n` +
      `Firma: ${row.company_size} osób\n` +
      `Disappointment: <b>${score}/10</b>\n` +
      `Gotów płacić: ${pay}\n` +
      `Zapisałby się: ${subscribe}\n` +
      `Kontakt: ${row.contact_email || 'brak'}\n` +
      `Pain point: ${row.pain_point || '-'}`
    );

    // Email notification to founder
    if (process.env.FOUNDER_EMAIL) {
      const { sendFounderSurveyNotification } = await import('@/lib/email');
      await sendFounderSurveyNotification(row);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Survey] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
