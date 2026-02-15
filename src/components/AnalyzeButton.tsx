'use client';

import { useState } from 'react';
import type { DetectedRoom } from './MeasurementCanvas';

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

export interface AnalysisResult {
  rooms: DetectedRoom[];
  outline: { x: number; y: number; width: number; height: number } | null;
  floorName: string | null;
  scale: { label: string; dimensionValue: number | null; dimensionUnit: 'mm' | 'cm' | null; startX: number | null; startY: number | null; endX: number | null; endY: number | null } | null;
  tableRooms: { name: string; areaMFromTable: number }[] | null;
}

interface Props {
  imageUrl: string | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export async function runAnalysis(
  imageUrl: string,
  onLoadingChange?: (loading: boolean) => void,
): Promise<AnalysisResult | { error: string }> {
  onLoadingChange?.(true);

  try {
    const res = await fetch('/api/analyze-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imageUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Błąd analizy' };
    }

    if (data.rooms && data.rooms.length > 0) {
      const rooms: DetectedRoom[] = data.rooms.map(
        (r: { name: string; points: number[][]; areaMFromTable?: number }, i: number) => ({
          id: `ai_${Date.now()}_${i}`,
          name: r.name,
          points: r.points,
          ...(typeof r.areaMFromTable === 'number' ? { areaMFromTable: r.areaMFromTable } : {}),
        })
      );
      return {
        rooms,
        outline: data.outline || null,
        floorName: data.floorName || null,
        scale: data.scale || null,
        tableRooms: data.tableRooms || null,
      };
    } else {
      return { error: 'Nie wykryto pomieszczeń' };
    }
  } catch {
    return { error: 'Błąd połączenia z API' };
  } finally {
    onLoadingChange?.(false);
  }
}

export default function AnalyzeButton({ imageUrl, onAnalysisComplete, onLoadingChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    setLoading(true);
    setError(null);

    const result = await runAnalysis(imageUrl, onLoadingChange);

    if ('error' in result) {
      setError(result.error);
    } else {
      onAnalysisComplete(result);
    }

    setLoading(false);
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
          {loading ? 'Analizuję...' : 'AI Skanuj ponownie'}
        </span>
      </button>
      {error && (
        <span className="app-analyze-error">{error}</span>
      )}
    </div>
  );
}
