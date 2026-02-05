import { NextResponse } from 'next/server';

// Mock data for MVP - later integrate with OpenAI Vision
export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Brak URL obrazu' },
        { status: 400 }
      );
    }

    // Mock response - simulating AI detection
    // TODO: Replace with OpenAI Vision API call
    const mockRooms = [
      {
        id: '1',
        name: 'Salon',
        area: 28.5,
        perimeter: 21.4,
        bounds: { x: 100, y: 100, width: 300, height: 200 }
      },
      {
        id: '2', 
        name: 'Kuchnia',
        area: 12.3,
        perimeter: 14.2,
        bounds: { x: 420, y: 100, width: 180, height: 150 }
      },
      {
        id: '3',
        name: 'Sypialnia',
        area: 16.8,
        perimeter: 16.4,
        bounds: { x: 100, y: 320, width: 200, height: 180 }
      },
      {
        id: '4',
        name: 'Łazienka',
        area: 6.2,
        perimeter: 10.0,
        bounds: { x: 320, y: 320, width: 100, height: 120 }
      }
    ];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      rooms: mockRooms,
      totalArea: mockRooms.reduce((sum, r) => sum + r.area, 0),
      scale: '1:100'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Błąd analizy' },
      { status: 500 }
    );
  }
}
