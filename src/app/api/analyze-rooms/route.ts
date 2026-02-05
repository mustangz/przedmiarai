import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_key') {
      return NextResponse.json(
        { error: 'Brak skonfigurowanego klucza OPENAI_API_KEY' },
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

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
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
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:')
                  ? imageBase64
                  : `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content?.trim();
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
