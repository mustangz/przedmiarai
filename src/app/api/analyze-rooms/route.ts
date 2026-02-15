import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface RoomResult {
  name: string;
  points: number[][]; // [[x1,y1], [x2,y2], ...] as % of image (0-100)
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
  dimensionValue: number | null;
  dimensionUnit: 'mm' | 'cm' | null;
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
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
      if (!Array.isArray(room.points) || room.points.length < 3) return false;
      // Each point must be a [x, y] pair with values 0-100
      return room.points.every(
        (p) =>
          Array.isArray(p) &&
          p.length === 2 &&
          typeof p[0] === 'number' &&
          typeof p[1] === 'number' &&
          p[0] >= -5 && p[0] <= 105 &&
          p[1] >= -5 && p[1] <= 105
      );
    })
    .map((room) => ({
      name: room.name || 'Pomieszczenie',
      points: room.points.map((p) => [clamp(p[0], 0, 100), clamp(p[1], 0, 100)]),
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
  const tolerance = 5;
  const oLeft = outline.x - tolerance;
  const oTop = outline.y - tolerance;
  const oRight = outline.x + outline.width + tolerance;
  const oBottom = outline.y + outline.height + tolerance;

  return rooms.filter((room) => {
    // Check that centroid of polygon is inside outline
    const cx = room.points.reduce((s, p) => s + p[0], 0) / room.points.length;
    const cy = room.points.reduce((s, p) => s + p[1], 0) / room.points.length;
    return cx >= oLeft && cx <= oRight && cy >= oTop && cy <= oBottom;
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
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Jesteś ekspertem budowlanym analizującym rysunki architektoniczne i konstrukcyjne.

SIATKA REFERENCYJNA — JAK CZYTAĆ WSPÓŁRZĘDNE:
Na obraz nałożona jest czerwona siatka z etykietami "X,Y" na skrzyżowaniach.
Etykiety mają format "kolumna,wiersz" np. "30,40" oznacza x=30%, y=40% obrazu.
Główne linie co 10% (0,10,20...100). Przerywane linie co 5%.

Rysunek może być rzutem parteru/piętra (pomieszczenia), fundamentów (strefy fundamentowe), przekrojem lub innym rysunkiem technicznym.`,
            },
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
              text: `Przeanalizuj ten rysunek budowlany. Wykryj WSZYSTKIE wydzielone obszary/strefy.

INSTRUKCJA — dla każdego obszaru:
1. Znajdź narożniki ścian/krawędzi obszaru
2. Dla KAŻDEGO narożnika: odczytaj jego pozycję z czerwonej siatki referencyjnej (etykiety "X,Y")
3. Interpoluj precyzyjnie: jeśli punkt jest między siatką 20 a 30, bliżej 20 → wartość ≈ 23
4. Zapisz jako polygon [[x1,y1], [x2,y2], ...] — współrzędne 0-100 (% obrazu)

ZASADY:
- Nazwy ODCZYTUJ z etykiet na rysunku — NIE wymyślaj
- Jeśli brak etykiety → "Strefa 1", "Strefa 2" itd.
- Minimum 3 punkty na polygon, zwykle 4-8
- Kolejność: zgodnie z ruchem wskazówek zegara
- Obszary NIE MOGĄ się nakładać
- Sąsiednie obszary MUSZĄ dzielić punkty wspólnej krawędzi
- IGNORUJ legendy, pieczątki, ramki, tabelki — tylko rysunek techniczny
- IGNORUJ czerwoną siatkę — to nakładka pomocnicza

Dodatkowo wykryj: outline (bounding box ścian zewnętrznych), skalę, tabelę zestawienia, nazwę rysunku.

Odpowiedz WYŁĄCZNIE JSON:
\`\`\`json
{
  "floorName": "Rzut fundamentów",
  "outline": { "x": 15, "y": 10, "width": 60, "height": 75 },
  "scale": { "label": "1:100", "dimensionValue": 1524, "dimensionUnit": "cm", "startX": 22, "startY": 12, "endX": 78, "endY": 12 },
  "tableRooms": [{ "name": "Ława fundamentowa", "areaMFromTable": 25.5 }],
  "rooms": [
    { "name": "Salon", "points": [[20,15], [45,15], [45,45], [20,45]] },
    { "name": "Kuchnia", "points": [[45,15], [65,15], [65,35], [50,35], [50,45], [45,45]] }
  ]
}
\`\`\`
Pola: rooms[].points — % obrazu (0-100), odczytane z siatki. outline/scale/tableRooms — null jeśli brak.`,
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
      console.error('Failed to parse AI response:', content.substring(0, 2000));
      return NextResponse.json(
        { error: 'Nie udało się przetworzyć odpowiedzi AI', rawExcerpt: content.substring(0, 500) },
        { status: 500 }
      );
    }

    console.log('[AI] Raw rooms:', JSON.stringify(parsed.rooms, null, 2));
    console.log('[AI] Raw outline:', JSON.stringify(parsed.outline));
    console.log('[AI] Raw scale:', JSON.stringify(parsed.scale));

    const outline = validateOutline(parsed.outline);
    const afterClamp = validateAndClampRooms(parsed.rooms);
    console.log('[AI] After clamp validation:', afterClamp.length, 'of', parsed.rooms.length);
    const validatedRooms = validateRoomsAgainstOutline(afterClamp, outline);
    console.log('[AI] After outline validation:', validatedRooms.length, 'of', afterClamp.length);

    const tableRooms: TableRoom[] | null = Array.isArray(parsed.tableRooms)
      ? parsed.tableRooms.filter(
          (t) => typeof t.name === 'string' && typeof t.areaMFromTable === 'number'
        )
      : null;

    const scaleResult: ScaleResult | null =
      parsed.scale && typeof parsed.scale.label === 'string'
        ? {
            label: parsed.scale.label,
            dimensionValue:
              typeof parsed.scale.dimensionValue === 'number'
                ? parsed.scale.dimensionValue
                : null,
            dimensionUnit:
              parsed.scale.dimensionUnit === 'cm' ? 'cm'
                : parsed.scale.dimensionUnit === 'mm' ? 'mm'
                : null,
            startX:
              typeof parsed.scale.startX === 'number'
                ? clamp(parsed.scale.startX, 0, 100)
                : null,
            startY:
              typeof parsed.scale.startY === 'number'
                ? clamp(parsed.scale.startY, 0, 100)
                : null,
            endX:
              typeof parsed.scale.endX === 'number'
                ? clamp(parsed.scale.endX, 0, 100)
                : null,
            endY:
              typeof parsed.scale.endY === 'number'
                ? clamp(parsed.scale.endY, 0, 100)
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
