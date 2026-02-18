export async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[Telegram] Not configured, skipping:', text);
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('[Telegram] Failed to send:', err);
  }
}

export async function notifyNewSubmission(submission: {
  fileName: string;
  userEmail: string;
  submissionId: string;
}) {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://przedmiarai.pl'}/admin/submissions/${submission.submissionId}`;

  await sendTelegramMessage(
    `📋 <b>Nowy przedmiar!</b>\n\n` +
    `Od: ${submission.userEmail}\n` +
    `Plik: ${submission.fileName}\n\n` +
    `<a href="${adminUrl}">Otwórz w adminie</a>`
  );
}
