import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

interface PozycjaPrzedmiaru {
  lp: string;
  podstawa: string;
  opis: string;
  jednostka: string;
  ilosc: string;
  uwagi: string;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Brak skonfigurowanego klucza ANTHROPIC_API_KEY' },
        { status: 500 }
      );
    }

    const { pages } = await request.json() as { pages: string[] };

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'Brak stron do analizy' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    // Build image content blocks for all pages
    const imageBlocks: Anthropic.Messages.ContentBlockParam[] = [];
    for (let i = 0; i < pages.length; i++) {
      let base64Data = pages[i];
      let mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' = 'image/jpeg';

      if (base64Data.startsWith('data:')) {
        const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          mediaType = match[1] as typeof mediaType;
          base64Data = match[2];
        }
      }

      imageBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      });

      if (pages.length > 1) {
        imageBlocks.push({
          type: 'text',
          text: `[Strona ${i + 1} z ${pages.length}]`,
        });
      }
    }

    imageBlocks.push({
      type: 'text',
      text: `Jesteś ekspertem od przedmiarów budowlanych. Analizujesz dokument przedmiaru robót budowlanych.

ZADANIE: Wyodrębnij WSZYSTKIE pozycje z tego przedmiaru. Dla każdej pozycji podaj:

- lp: numer pozycji (np. "1", "1.1", "2d.1")
- podstawa: podstawa wyceny / numer katalogowy (np. "KNR 2-01 0126-02", "KNNR 1 0111-01"). Jeśli brak - pustry string.
- opis: pełny opis robót (np. "Wykopy jamiste o głębokości do 1.5m, kat. gruntu III")
- jednostka: jednostka miary (np. "m³", "m²", "mb", "szt", "kg", "m", "kpl")
- ilosc: ilość/obmiar (np. "12.500", "145.00"). Tylko liczba.
- uwagi: dodatkowe informacje, obliczenia obmiaru, uwagi. Jeśli brak - pusty string.

WAŻNE ZASADY:
1. Wyodrębnij KAŻDĄ pozycję - nie pomijaj żadnej
2. Zachowaj oryginalną numerację z dokumentu
3. Rozpoznawaj sekcje/działy (np. "ROBOTY ZIEMNE", "FUNDAMENTY") - dodaj je jako pozycje z opisem będącym nazwą sekcji i pustymi pozostałymi polami
4. Jeśli dokument zawiera obliczenia obmiaru (np. "2*(3.5+4.2)*2.8"), umieść je w polu uwagi
5. Ilość podawaj jako string z liczbą (np. "12.500")
6. Jeśli na stronie brak pozycji przedmiarowych - pomiń tę stronę

Odpowiedz WYŁĄCZNIE poprawnym JSON w formacie:
{"pozycje": [{"lp": "1", "podstawa": "KNR 2-01 0126-02", "opis": "Wykopy jamiste...", "jednostka": "m³", "ilosc": "12.500", "uwagi": ""}, ...]}

Nie dodawaj żadnego tekstu poza JSON. Jeśli nie ma pozycji, zwróć {"pozycje": []}.`,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      messages: [
        {
          role: 'user',
          content: imageBlocks,
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

    let parsed: { pozycje: PozycjaPrzedmiaru[] };
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Nie udało się przetworzyć odpowiedzi AI', raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pozycje: parsed.pozycje || [],
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('Analyze przedmiar error:', error);
    const message = error instanceof Error ? error.message : 'Nieznany błąd';
    return NextResponse.json(
      { error: `Błąd analizy przedmiaru: ${message}` },
      { status: 500 }
    );
  }
}
