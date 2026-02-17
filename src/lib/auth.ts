import { createServerSupabase } from './supabase';
import { randomBytes } from 'crypto';
import { NextRequest } from 'next/server';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function validateUserToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) return null;

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('token', token)
    .single();

  return data;
}

export function validateAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return token === process.env.ADMIN_SECRET;
}

export async function getOrCreateUser(email: string) {
  const supabase = createServerSupabase();

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) return existing;

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ email: email.toLowerCase() })
    .select()
    .single();

  if (error) throw error;
  return newUser;
}

export async function createMagicLink(email: string): Promise<string> {
  const supabase = createServerSupabase();
  const token = generateToken();
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  await supabase.from('magic_links').insert({
    email: email.toLowerCase(),
    token,
    expires_at,
  });

  return token;
}

export async function verifyMagicLink(token: string) {
  const supabase = createServerSupabase();

  const { data: link } = await supabase
    .from('magic_links')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single();

  if (!link) return null;
  if (new Date(link.expires_at) < new Date()) return null;

  // Mark as used
  await supabase
    .from('magic_links')
    .update({ used: true })
    .eq('id', link.id);

  // Get or create user + generate session token
  const user = await getOrCreateUser(link.email);
  const sessionToken = generateToken();

  await supabase
    .from('users')
    .update({ token: sessionToken })
    .eq('id', user.id);

  return { user: { ...user, token: sessionToken }, sessionToken };
}
