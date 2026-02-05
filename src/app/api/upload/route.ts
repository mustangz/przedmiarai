import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Brak pliku' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Upload to Supabase Storage
    const fileName = `${projectId}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Błąd uploadu' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: data.path 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
