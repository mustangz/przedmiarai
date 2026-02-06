import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface RoomResult {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  areaMFromTable?: number;
}

interface OutlineResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TableRoom {
  name: string;
  areaMFromTable: number;
}

interface ScaleResult {
  label: string;
  estimatedPxPerM: number | null;
}

interface ParsedResponse {
  floorName?: string;
  outline?: OutlineResult;
  scale?: ScaleResult;
  tableRooms?: TableRoom[];
  rooms: RoomResult[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function validateAndClampRooms(rooms: RoomResult[]): RoomResult[] {
  return rooms
    .filter((room) => {
      if (
        typeof room.x !== 'number' ||
        typeof room.y !== 'number' ||
        typeof room.width !== 'number' ||
        typeof room.height !== 'number'
      ) {
        return false;
      }
      if (room.width <= 1 || room.height <= 1) return false;
      if (room.width > 100 || room.height > 100) return false;
      if (room.x < 0 || room.x > 100 || room.y < 0 || room.y > 100) return false;
      if (room.x + room.width > 105 || room.y + room.height > 105) return false;
      return true;
    })
    .map((room) => ({
      name: room.name || 'Pomieszczenie',
      x: clamp(room.x, 0, 100),
      y: clamp(room.y, 0, 100),
      width: clamp(room.width, 1, 100 - clamp(room.x, 0, 99)),
      height: clamp(room.height, 1, 100 - clamp(room.y, 0, 99)),
      ...(typeof room.areaMFromTable === 'number' ? { areaMFromTable: room.areaMFromTable } : {}),
    }));
}

function validateOutline(outline: unknown): OutlineResult | null {
  if (!outline || typeof outline !== 'object') return null;
  const o = outline as Record<string, unknown>;
  if (
    typeof o.x !== 'number' || typeof o.y !== 'number' ||
    typeof o.width !== 'number' || typeof o.height !== 'number'
  ) return null;
  if (o.width <= 1 || o.height <= 1) return null;
  return {
    x: clamp(o.x as number, 0, 100),
    y: clamp(o.y as number, 0, 100),
    width: clamp(o.width as number, 1, 100),
    height: clamp(o.height as number, 1, 100),
  };
}

function validateRoomsAgainstOutline(rooms: RoomResult[], outline: OutlineResult | null): RoomResult[] {
  if (!outline) return rooms;
  const tolerance = 2; // 2% tolerance
  return rooms.filter((room) => {
    return (
      room.x >= outline.x - tolerance &&
      room.y >= outline.y - tolerance &&
      room.x + room.width <= outline.x + outline.width + tolerance &&
      room.y + room.height <= outline.y + outline.height + tolerance
    );
  });
}

function parseJsonFromResponse(content: string): ParsedResponse | null {
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
      system: `Jesteś ekspertem architektem. Analizujesz rzuty architektoniczne warstwa po warstwie, od zewnątrz do wewnątrz.

HIERARCHIA WARSTW:
1. WYMIARY ZEWNĘTRZNE — linie wymiarowe poza budynkiem, to absolutna granica rysunku
2. ŚCIANY ZEWNĘTRZNE — najgrubsze linie, obrys budynku, z otworami (okna, drzwi wejściowe)
3. ŚCIANY WEWNĘTRZNE — nośne (grubsze) i działowe (cieńsze), dzielą budynek na pomieszczenia
4. POMIESZCZENIA — zamknięte przestrzenie ograniczone ścianami, z etykietami i metrażem

ZASADY:
- Pomieszczenia istnieją WYŁĄCZNIE wewnątrz obrysu ścian zewnętrznych
- IGNORUJ legendy, tabelki pomieszczeń, pieczątki, ramki — to NIE są pomieszczenia
- Tabela zestawienia pomieszczeń to źródło prawdy o nazwach i powierzchniach
- Współrzędne jako % wymiarów obrazu (0-100)`,
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
Co widzisz? Gdzie jest rzut, legenda, pieczątka, tabela pomieszczeń? Jaka kondygnacja?

KROK 2 — TABELA POMIESZCZEŃ:
Odczytaj tabelę zestawienia pomieszczeń (jeśli jest). Lista: nazwa + powierzchnia (m²).
To będzie checklist do weryfikacji.

KROK 3 — OBRYS BUDYNKU:
Zidentyfikuj ściany zewnętrzne (najgrubsze linie). Podaj bounding box CAŁEGO rzutu
(obrys ścian zewnętrznych) jako % obrazu: x, y, width, height.

KROK 4 — SKALA I WYMIARY:
Znajdź skalę rysunku (np. "1:100") i wymiary zewnętrzne (np. "12.50 m").
Jeśli widzisz wymiar i możesz oszacować ile pikseli zajmuje — podaj proporcję.

KROK 5 — POMIESZCZENIA:
Wykryj pomieszczenia WYŁĄCZNIE wewnątrz obrysu z kroku 3.
Dopasuj nazwy do tabeli z kroku 2. Podaj bounding box każdego jako % obrazu.

KROK 6 — WERYFIKACJA:
- Czy liczba pokoi zgadza się z tabelą?
- Czy każdy pokój mieści się w obrysie budynku?
- Czy proporcje powierzchni są sensowne?

Na końcu podaj wynik jako JSON w bloku:
\`\`\`json
{
  "floorName": "Rzut parteru",
  "outline": { "x": 15, "y": 10, "width": 60, "height": 75 },
  "scale": { "label": "1:100", "estimatedPxPerM": 45 },
  "tableRooms": [
    { "name": "Salon", "areaMFromTable": 25.5 }
  ],
  "rooms": [
    { "name": "Salon", "x": 20, "y": 15, "width": 25, "height": 30, "areaMFromTable": 25.5 }
  ]
}
\`\`\`

Jeśli nie widzisz żadnych pomieszczeń, zwróć:
\`\`\`json
{"rooms": []}
\`\`\`

Uwagi:
- outline, scale, tableRooms mogą być null jeśli nie udało się ich wykryć
- areaMFromTable w rooms to powierzchnia z tabeli (jeśli znaleziono dopasowanie)`,
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

    const outline = validateOutline(parsed.outline);
    let validatedRooms = validateAndClampRooms(parsed.rooms);
    validatedRooms = validateRoomsAgainstOutline(validatedRooms, outline);

    const tableRooms: TableRoom[] | null = Array.isArray(parsed.tableRooms)
      ? parsed.tableRooms.filter(
          (t) => typeof t.name === 'string' && typeof t.areaMFromTable === 'number'
        )
      : null;

    const scaleResult: ScaleResult | null =
      parsed.scale && typeof parsed.scale.label === 'string'
        ? {
            label: parsed.scale.label,
            estimatedPxPerM:
              typeof parsed.scale.estimatedPxPerM === 'number'
                ? parsed.scale.estimatedPxPerM
                : null,
          }
        : null;

    return NextResponse.json({
      success: true,
      rooms: validatedRooms,
      outline,
      floorName: typeof parsed.floorName === 'string' ? parsed.floorName : null,
      scale: scaleResult,
      tableRooms: tableRooms && tableRooms.length > 0 ? tableRooms : null,
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
