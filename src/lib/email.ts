import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'PrzedmiarAI <onboarding@resend.dev>';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'dummy');
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set, skipping:', subject, '→', to);
    return;
  }

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log('[Email] Sent:', subject, '→', to);
  } catch (err) {
    console.error('[Email] Failed:', err);
  }
}

export async function sendMagicLinkEmail(email: string, token: string, redirect?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiarai.pl';
  const link = `${baseUrl}/auth/verify?token=${token}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;

  await sendEmail(
    email,
    'Twój dostęp do panelu beta — PrzedmiarAI',
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #1f2937;">
      <h2 style="margin: 0 0 20px; color: #7c3aed; font-size: 20px;">Przedmiar<span style="color: #a78bfa;">AI</span></h2>
      <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6;">Cześć!</p>
      <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">Kliknij poniżej, żeby otworzyć panel beta:</p>
      <a href="${link}" style="display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 0 0 20px;">
        Otwórz panel &rarr;
      </a>
      <div style="padding: 12px 16px; background-color: #f5f3ff; border-radius: 6px; margin: 0 0 20px; font-size: 14px; line-height: 1.7; color: #4b5563;">
        <strong style="color: #1f2937;">Co możesz przetestować:</strong><br>
        &bull; Wgraj rzut PDF (budynek architektoniczny)<br>
        &bull; AI zmierzy powierzchnie podłóg, ścian, obwody<br>
        &bull; Eksport wyników do Excela
      </div>
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 4px;">Link wygasa za 15 minut.</p>
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 20px;">Jeśli nie prosiłeś o dostęp, zignoruj tę wiadomość.</p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
        Pozdrawiam,<br>
        <strong style="color: #1f2937;">Marcin z PrzedmiarAI</strong>
      </p>
    </div>
    `
  );
}

export async function sendFounderNotification(submission: {
  fileName: string;
  userEmail: string;
  submissionId: string;
}) {
  const founderEmail = process.env.FOUNDER_EMAIL;
  if (!founderEmail) return;

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiarai.pl'}/admin/submissions/${submission.submissionId}`;

  await sendEmail(
    founderEmail,
    `Nowy przedmiar: ${submission.fileName}`,
    `
    <div style="font-family: sans-serif; padding: 20px;">
      <h3>Nowy przedmiar!</h3>
      <p><strong>Od:</strong> ${submission.userEmail}</p>
      <p><strong>Plik:</strong> ${submission.fileName}</p>
      <a href="${adminUrl}" style="display: inline-block; padding: 10px 20px; background: #8b5cf6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 12px;">
        Otwórz w adminie
      </a>
    </div>
    `
  );
}

export async function sendSurveyEmail(email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiarai.pl';
  const surveyUrl = `${baseUrl}/ankieta`;

  await sendEmail(
    email,
    'Jak Ci poszło z PrzedmiarAI? (2 min)',
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #1f2937;">
      <h2 style="margin: 0 0 20px; color: #7c3aed; font-size: 20px;">Przedmiar<span style="color: #a78bfa;">AI</span></h2>
      <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6;">Cześć!</p>
      <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6;">Dzięki, że przetestowałeś PrzedmiarAI. Mam do Ciebie krótką ankietę — <strong>2 minuty</strong>, 14 pytań.</p>
      <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">Żadnych nagród za wypełnienie — zależy mi na szczerych odpowiedziach od ludzi, którzy faktycznie tego używają.</p>
      <a href="${surveyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 0 0 20px;">
        Wypełnij ankietę &rarr;
      </a>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
        Pozdrawiam,<br>
        <strong style="color: #1f2937;">Marcin z PrzedmiarAI</strong>
      </p>
    </div>
    `
  );
}

export async function sendFounderSurveyNotification(survey: {
  role: string | null;
  company_size: string | null;
  disappointment_score: number | null;
  willing_to_pay: string | null;
  would_subscribe: string | null;
  contact_email: string | null;
  pain_point: string | null;
}) {
  const founderEmail = process.env.FOUNDER_EMAIL;
  if (!founderEmail) return;

  await sendEmail(
    founderEmail,
    `Ankieta: ${survey.role} | Score: ${survey.disappointment_score}/10`,
    `
    <div style="font-family: sans-serif; padding: 20px;">
      <h3>Nowa odpowiedź z ankiety</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 4px 8px; font-weight: bold;">Rola:</td><td style="padding: 4px 8px;">${survey.role}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Firma:</td><td style="padding: 4px 8px;">${survey.company_size} osób</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Disappointment:</td><td style="padding: 4px 8px;"><strong>${survey.disappointment_score}/10</strong></td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Gotów płacić:</td><td style="padding: 4px 8px;">${survey.willing_to_pay}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Zapisałby się:</td><td style="padding: 4px 8px;">${survey.would_subscribe}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Kontakt:</td><td style="padding: 4px 8px;">${survey.contact_email || 'brak'}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Pain point:</td><td style="padding: 4px 8px;">${survey.pain_point || '-'}</td></tr>
      </table>
    </div>
    `
  );
}

export async function sendUserResultNotification(email: string, submissionId: string) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiarai.pl'}/dashboard`;

  await sendEmail(
    email,
    'Twój przedmiar jest gotowy! — PrzedmiarAI',
    `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px;">
      <h2 style="color: #fafafa;">PrzedmiarAI</h2>
      <p>Cześć!</p>
      <p>Twój przedmiar został przeanalizowany i jest gotowy do pobrania.</p>
      <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
        Otwórz panel
      </a>
      <p>Pozdrawiam,<br/>Zespół PrzedmiarAI</p>
    </div>
    `
  );
}
