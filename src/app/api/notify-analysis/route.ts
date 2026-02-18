import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const { fileName, userEmail, pozycjeCount, pagesCount } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ ok: true }); // silently skip
    }

    // Founder email notification
    const founderEmail = process.env.FOUNDER_EMAIL;
    if (founderEmail && process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM_EMAIL || 'PrzedmiarAI <onboarding@resend.dev>';

      await resend.emails.send({
        from,
        to: founderEmail,
        subject: `Panel beta: ${userEmail} przeanalizował przedmiar`,
        html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>Ktoś użył panelu beta!</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Plik:</strong> ${fileName || 'brak nazwy'}</p>
          <p><strong>Wynik:</strong> ${pozycjeCount || 0} pozycji z ${pagesCount || 0} stron</p>
        </div>
        `,
      });
    }

    // Telegram notification
    await sendTelegramMessage(
      `📊 <b>Panel beta — analiza!</b>\n\n` +
      `Email: ${userEmail}\n` +
      `Plik: ${fileName || 'brak'}\n` +
      `Wynik: ${pozycjeCount || 0} pozycji z ${pagesCount || 0} stron`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Notify analysis error:', err);
    return NextResponse.json({ ok: true }); // don't fail user flow
  }
}
