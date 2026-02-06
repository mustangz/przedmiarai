import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface RoomResult {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function validateAndClampRooms(rooms: RoomResult[]): RoomResult[] {
  return rooms
    .filter((room) => {
      // Must have valid numeric coordinates
      if (
        typeof room.x !== 'number' ||
        typeof room.y !== 'number' ||
        typeof room.width !== 'number' ||
        typeof room.height !== 'number'
      ) {
        return false;
      }
      // width/height must be > 1%
      if (room.width <= 1 || room.height <= 1) return false;
      // width/height must be <= 100%
      if (room.width > 100 || room.height > 100) return false;
      // x/y must be in reasonable range
      if (room.x < 0 || room.x > 100 || room.y < 0 || room.y > 100) return false;
      // x+width and y+height must not exceed 105% (tolerance)
      if (room.x + room.width > 105 || room.y + room.height > 105) return false;
      return true;
    })
    .map((room) => ({
      name: room.name || 'Pomieszczenie',
      x: clamp(room.x, 0, 100),
      y: clamp(room.y, 0, 100),
      width: clamp(room.width, 1, 100 - clamp(room.x, 0, 99)),
      height: clamp(room.height, 1, 100 - clamp(room.y, 0, 99)),
    }));
}

function parseJsonFromResponse(content: string): { rooms: RoomResult[] } | null {
  // Try extracting from ```json code block first
  const codeBlockMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // fall through
    }
  }

  // Fallback: find last occurrence of {"rooms": ...}
  const jsonMatches = content.match(/\{[\s\S]*"rooms"\s*:\s*\[[\s\S]*\]\s*\}/g);
  if (jsonMatches && jsonMatches.length > 0) {
    try {
      return JSON.parse(jsonMatches[jsonMatches.length - 1]);
    } catch {
      // fall through
    }
  }

  // Last resort: try parsing the whole content
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
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
      max_tokens: 4096,
      system: `Jesteś ekspertem architektem i analitykiem rysunków technicznych budynków. Twoje zadanie to precyzyjna identyfikacja pomieszczeń na rzutach architektonicznych.

ZASADY:
- Identyfikuj WYŁĄCZNIE zamknięte pomieszczenia (pokoje, kuchnie, łazienki, korytarze, balkony itp.)
- IGNORUJ: legendy, tabelki, pieczątki projektowe, ramki rysunku, opisy techniczne, przekroje
- Bounding box każdego pomieszczenia musi precyzyjnie obejmować jego ściany (nie za duży, nie za mały)
- Jeśli na rysunku jest kilka kondygnacji — analizuj każdą osobno
- NIE wymyślaj pomieszczeń których nie ma na rysunku
- Jeśli nie jesteś pewien czy coś jest pomieszczeniem — pomiń to
- Współrzędne podawaj jako procent wymiarów obrazu (0-100)`,
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
              text: `Przeanalizuj ten rysunek architektoniczny krok po kroku:

KROK 1 — OPIS RYSUNKU:
Opisz co widzisz na rysunku. Gdzie jest legenda/pieczątka/tabelka (jeśli jest)? Ile kondygnacji przedstawia rysunek? Gdzie znajduje się właściwy rzut?

KROK 2 — LISTA POMIESZCZEŃ:
Wymień wszystkie zamknięte pomieszczenia które widzisz na rzucie (TYLKO na rzucie, nie w legendach/tabelkach). Podaj ich nazwy.

KROK 3 — PRECYZYJNE WSPÓŁRZĘDNE:
Dla każdego pomieszczenia określ precyzyjne współrzędne bounding box jako procent wymiarów CAŁEGO obrazu:
- x: lewa krawędź pomieszczenia (0 = lewa krawędź obrazu, 100 = prawa)
- y: górna krawędź pomieszczenia (0 = górna krawędź obrazu, 100 = dolna)
- width: szerokość pomieszczenia jako % szerokości obrazu
- height: wysokość pomieszczenia jako % wysokości obrazu

Na końcu podaj wynik jako JSON w bloku:
\`\`\`json
{"rooms": [{"name": "Salon", "x": 10, "y": 15, "width": 30, "height": 25}, ...]}
\`\`\`

Jeśli nie widzisz żadnych pomieszczeń, zwróć:
\`\`\`json
{"rooms": []}
\`\`\``,
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

    const parsed = parseJsonFromResponse(content);
    if (!parsed || !Array.isArray(parsed.rooms)) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Nie udało się przetworzyć odpowiedzi AI' },
        { status: 500 }
      );
    }

    const validatedRooms = validateAndClampRooms(parsed.rooms);

    return NextResponse.json({
      success: true,
      rooms: validatedRooms,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Analyze rooms error:', message);
    return NextResponse.json(
      { error: `Błąd analizy pomieszczeń: ${message}` },
      { status: 500 }
    );
  }
}
