'use client';

import { useState } from 'react';

// ─── Inline SVG icons ─────────────────────────────────────────
const Icons = {
  Sparkles: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  Loader: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};

export interface DetectedRoom {
  id: string;
  name: string;
  x: number;      // % of image width
  y: number;      // % of image height
  width: number;  // % of image width
  height: number; // % of image height
  areaMFromTable?: number;
}

export interface AnalysisResult {
  rooms: DetectedRoom[];
  outline: { x: number; y: number; width: number; height: number } | null;
  floorName: string | null;
  scale: { label: string; estimatedPxPerM: number | null } | null;
  tableRooms: { name: string; areaMFromTable: number }[] | null;
}

interface Props {
  imageUrl: string | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function AnalyzeButton({ imageUrl, onAnalysisComplete, onLoadingChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setError(null);
    onLoadingChange?.(true);

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
          (r: { name: string; x: number; y: number; width: number; height: number; areaMFromTable?: number }, i: number) => ({
            id: `ai_${Date.now()}_${i}`,
            name: r.name,
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            ...(typeof r.areaMFromTable === 'number' ? { areaMFromTable: r.areaMFromTable } : {}),
          })
        );
        onAnalysisComplete({
          rooms,
          outline: data.outline || null,
          floorName: data.floorName || null,
          scale: data.scale || null,
          tableRooms: data.tableRooms || null,
        });
      } else {
        setError('Nie wykryto pomieszczeń');
      }
    } catch {
      setError('Błąd połączenia z API');
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  if (!imageUrl) return null;

  return (
    <div className="app-analyze-inline">
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading}
        className="app-analyze-btn"
      >
        <span className="app-analyze-btn-glow" />
        <span className="app-analyze-btn-inner">
          {loading ? <Icons.Loader /> : <Icons.Sparkles />}
          {loading ? 'Analizuję...' : 'AI Wykryj pomieszczenia'}
        </span>
      </button>
      {error && (
        <span className="app-analyze-error">{error}</span>
      )}
    </div>
  );
}
