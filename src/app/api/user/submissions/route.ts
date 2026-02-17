import { NextRequest, NextResponse } from 'next/server';
import { validateUserToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await validateUserToken(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, file_name, status, created_at, completed_at, excel_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ submissions: submissions || [] });
}
