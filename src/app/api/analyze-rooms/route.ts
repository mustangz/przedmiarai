import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Brak skonfigurowanego klucza ANTHROPIC_API_KEY' },
        { status: 500 }
      );
    }

    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Brak obrazu do analizy' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    // Extract base64 data and media type
    let base64Data = imageBase64;
    let mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' = 'image/png';
    
    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        mediaType = match[1] as typeof mediaType;
        base64Data = match[2];
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Zidentyfikuj wszystkie pomieszczenia na tym rysunku architektonicznym. Dla każdego pomieszczenia podaj:
- name: nazwa pomieszczenia (np. "Salon", "Kuchnia", "Łazienka", "Sypialnia", "Korytarz", "Pokój dzienny")
- x: współrzędna X lewego górnego rogu jako procent szerokości obrazu (0-100)
- y: współrzędna Y lewego górnego rogu jako procent wysokości obrazu (0-100)
- width: szerokość jako procent szerokości obrazu (0-100)
- height: wysokość jako procent wysokości obrazu (0-100)

Odpowiedz WYŁĄCZNIE poprawnym JSON w formacie:
{"rooms": [{"name": "Salon", "x": 10, "y": 15, "width": 30, "height": 25}, ...]}

Nie dodawaj żadnego tekstu poza JSON. Jeśli nie widzisz pomieszczeń, zwróć {"rooms": []}.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const content = textBlock && 'text' in textBlock ? textBlock.text.trim() : '';
    
    if (!content) {
      return NextResponse.json(
        { error: 'Brak odpowiedzi z AI' },
        { status: 500 }
      );
    }

    // Parse JSON from response (handle possible markdown code blocks)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Nie udało się przetworzyć odpowiedzi AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rooms: parsed.rooms || [],
    });
  } catch (error) {
    console.error('Analyze rooms error:', error);
    return NextResponse.json(
      { error: 'Błąd analizy pomieszczeń' },
      { status: 500 }
    );
  }
}
