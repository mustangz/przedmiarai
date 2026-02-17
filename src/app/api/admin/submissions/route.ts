import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (!validateAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get('status');
  const supabase = createServerSupabase();

  let query = supabase
    .from('submissions')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;

  return NextResponse.json({ submissions: data || [] });
}
