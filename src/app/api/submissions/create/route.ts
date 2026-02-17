import { NextRequest, NextResponse } from 'next/server';
import { validateUserToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { sendFounderNotification } from '@/lib/email';
import { notifyNewSubmission } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const user = await validateUserToken(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.credits_remaining <= 0 && user.plan !== 'firma') {
    return NextResponse.json({ error: 'Brak kredytów. Wykup wyższy plan.' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Brak pliku' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Błąd uploadu' }, { status: 500 });
    }

    // Get public URL (signed, 7 days)
    const { data: urlData } = await supabase.storage
      .from('submissions')
      .createSignedUrl(filePath, 7 * 24 * 60 * 60);

    // Create submission record
    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: urlData?.signedUrl || filePath,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Decrement credits (unless firma/unlimited)
    if (user.plan !== 'firma') {
      await supabase
        .from('users')
        .update({ credits_remaining: Math.max(0, user.credits_remaining - 1) })
        .eq('id', user.id);
    }

    // Notify founder
    const notifData = {
      fileName: file.name,
      userEmail: user.email,
      submissionId: submission.id,
    };

    await Promise.all([
      sendFounderNotification(notifData),
      notifyNewSubmission(notifData),
    ]);

    return NextResponse.json({
      id: submission.id,
      status: 'pending',
      file_name: file.name,
    });
  } catch (err) {
    console.error('Submission error:', err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
