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

/** Draw a reference grid overlay with labeled intersections for AI coordinate accuracy */
async function addGridOverlay(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      const w = img.width;
      const h = img.height;
      const lineW = Math.max(1, Math.round(Math.min(w, h) / 600));
      const fontSize = Math.max(9, Math.round(Math.min(w, h) / 80));

      // Draw major grid lines every 10% (thicker)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = lineW;
      for (let i = 0; i <= 10; i++) {
        const x = Math.round((i / 10) * w);
        const y = Math.round((i / 10) * h);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw minor grid lines every 5% (thinner, dashed)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.25)';
      ctx.lineWidth = Math.max(1, lineW * 0.5);
      ctx.setLineDash([4, 4]);
      for (let i = 1; i <= 19; i += 2) {
        const x = Math.round((i / 20) * w);
        const y = Math.round((i / 20) * h);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw coordinate labels at intersections along edges
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let col = 0; col <= 10; col++) {
        for (let row = 0; row <= 10; row++) {
          const x = Math.round((col / 10) * w);
          const y = Math.round((row / 10) * h);

          // Labels on top edge and left edge, plus every other intersection
          const isEdge = col === 0 || row === 0;
          const isEveryOther = col % 2 === 0 && row % 2 === 0;
          if (!isEdge && !isEveryOther) continue;

          const label = `${col * 10},${row * 10}`;
          const tw = ctx.measureText(label).width + 4;
          const th = fontSize + 2;

          // White background with border
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(x - tw / 2, y - th / 2, tw, th);
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x - tw / 2, y - th / 2, tw, th);

          // Label text
          ctx.fillStyle = 'rgba(200, 0, 0, 1)';
          ctx.fillText(label, x, y);
        }
      }

      const result = canvas.toDataURL('image/jpeg', 0.85);
      console.log('[addGridOverlay] Grid overlay applied:', w, 'x', h, '→', (result.length / 1024).toFixed(0), 'KB');
      resolve(result);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Compress image if base64 is too large for API (>4MB) */
async function compressIfNeeded(dataUrl: string, maxBytes = 4 * 1024 * 1024): Promise<string> {
  if (dataUrl.length < maxBytes) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Scale down to reduce size
      const maxDim = 2000;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', 0.8);
      console.log('[compressIfNeeded] Compressed from', (dataUrl.length / 1024).toFixed(0), 'KB to', (compressed.length / 1024).toFixed(0), 'KB');
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl); // fallback to original
    img.src = dataUrl;
  });
}

export async function runAnalysis(
  imageUrl: string,
  onLoadingChange?: (loading: boolean) => void,
): Promise<AnalysisResult | { error: string }> {
  onLoadingChange?.(true);

  try {
    const compressed = await compressIfNeeded(imageUrl);
    const withGrid = await addGridOverlay(compressed);
    const res = await fetch('/api/analyze-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: withGrid }),
    });

    const data = await res.json();
    console.log('[runAnalysis] API response status:', res.status, 'rooms:', data.rooms?.length, 'raw:', JSON.stringify(data).substring(0, 500));

    // DEBUG: draw AI polygons on grid image
    if (data.rooms?.length) {
      const debugImg = new Image();
      debugImg.onload = () => {
        const c = document.createElement('canvas');
        c.width = debugImg.width;
        c.height = debugImg.height;
        const cx = c.getContext('2d')!;
        cx.drawImage(debugImg, 0, 0);
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00', '#00ffff', '#ff8800', '#8800ff', '#00ff88'];
        data.rooms.forEach((room: { name: string; points: number[][] }, i: number) => {
          const color = colors[i % colors.length];
          cx.strokeStyle = color;
          cx.lineWidth = 3;
          cx.fillStyle = color + '33';
          cx.beginPath();
          room.points.forEach((p: number[], j: number) => {
            const px = (p[0] / 100) * c.width;
            const py = (p[1] / 100) * c.height;
            if (j === 0) cx.moveTo(px, py); else cx.lineTo(px, py);
          });
          cx.closePath();
          cx.fill();
          cx.stroke();
          // Label
          const centX = room.points.reduce((s: number, p: number[]) => s + p[0], 0) / room.points.length;
          const centY = room.points.reduce((s: number, p: number[]) => s + p[1], 0) / room.points.length;
          cx.font = 'bold 14px monospace';
          cx.fillStyle = color;
          cx.fillText(`${i}: ${room.name}`, (centX / 100) * c.width, (centY / 100) * c.height);
          // Point markers
          room.points.forEach((p: number[]) => {
            const px = (p[0] / 100) * c.width;
            const py = (p[1] / 100) * c.height;
            cx.fillStyle = '#fff';
            cx.beginPath(); cx.arc(px, py, 5, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = color;
            cx.beginPath(); cx.arc(px, py, 3, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#000';
            cx.font = '10px monospace';
            cx.fillText(`${p[0]},${p[1]}`, px + 6, py - 4);
          });
        });
        const debugWin = window.open('');
        if (debugWin) {
          debugWin.document.write(`<img src="${c.toDataURL('image/png')}" style="max-width:100%"/>`);
          debugWin.document.title = 'DEBUG: AI polygons on grid';
        }
      };
      debugImg.src = withGrid;
    }

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
