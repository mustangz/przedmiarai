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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiar.ai';
  const link = `${baseUrl}/auth/verify?token=${token}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;

  await sendEmail(
    email,
    'Twój link do logowania — PrzedmiarAI',
    `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px;">
      <h2 style="color: #fafafa;">PrzedmiarAI</h2>
      <p>Cześć!</p>
      <p>Kliknij poniższy przycisk, aby się zalogować:</p>
      <a href="${link}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
        Zaloguj się
      </a>
      <p style="color: #888; font-size: 13px;">Link wygasa za 15 minut.</p>
      <p style="color: #888; font-size: 13px;">Jeśli nie prosiłeś o logowanie, zignoruj tę wiadomość.</p>
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

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiar.ai'}/admin/submissions/${submission.submissionId}`;

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

export async function sendUserResultNotification(email: string, submissionId: string) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiar.ai'}/dashboard`;

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
