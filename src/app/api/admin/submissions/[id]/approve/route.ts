import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { generateExcel } from '@/lib/excel';
import { sendUserResultNotification } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { rows } = await req.json();

  if (!rows || !Array.isArray(rows)) {
    return NextResponse.json({ error: 'Missing rows' }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Get submission + user
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, users(email)')
    .eq('id', id)
    .single();

  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Generate Excel
  const excelBuffer = generateExcel(rows, submission.file_name);

  // Upload Excel to Supabase Storage
  const excelPath = `${submission.user_id}/${id}.xlsx`;
  await supabase.storage
    .from('submissions')
    .upload(excelPath, excelBuffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: true,
    });

  const { data: urlData } = await supabase.storage
    .from('submissions')
    .createSignedUrl(excelPath, 30 * 24 * 60 * 60); // 30 days

  // Update submission
  await supabase
    .from('submissions')
    .update({
      status: 'done',
      final_result: rows,
      excel_url: urlData?.signedUrl || '',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);

  // Notify user
  const userEmail = (submission as Record<string, unknown>).users
    ? ((submission as Record<string, unknown>).users as { email: string }).email
    : null;

  if (userEmail) {
    await sendUserResultNotification(userEmail, id);
  }

  return NextResponse.json({ ok: true, excel_url: urlData?.signedUrl });
}
