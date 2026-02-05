'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export interface DetectedRoom {
  id: string;
  name: string;
  x: number;      // % of image width
  y: number;      // % of image height
  width: number;  // % of image width
  height: number; // % of image height
}

interface Props {
  imageUrl: string | null;
  onRoomsDetected: (rooms: DetectedRoom[]) => void;
}

export default function AnalyzeButton({ imageUrl, onRoomsDetected }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd analizy');
        return;
      }

      if (data.rooms && data.rooms.length > 0) {
        const rooms: DetectedRoom[] = data.rooms.map(
          (r: { name: string; x: number; y: number; width: number; height: number }, i: number) => ({
            id: `ai_${Date.now()}_${i}`,
            name: r.name,
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
          })
        );
        onRoomsDetected(rooms);
      } else {
        setError('Nie wykryto pomieszczeń');
      }
    } catch {
      setError('Błąd połączenia z API');
    } finally {
      setLoading(false);
    }
  };

  if (!imageUrl) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="flex items-center gap-2 p-2 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? 'Analizuję...' : 'AI Wykryj pomieszczenia'}
      </button>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
