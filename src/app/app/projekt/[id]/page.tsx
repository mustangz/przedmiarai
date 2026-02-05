'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Upload,
  MousePointer2,
  Ruler,
  Download,
  Settings,
  ZoomIn,
  ZoomOut,
  Check,
  X,
} from 'lucide-react';
import MeasurementList from '@/components/MeasurementList';
import ScaleCalibration from '@/components/ScaleCalibration';
import AnalyzeButton from '@/components/AnalyzeButton';
import type { Measurement, DetectedRoom } from '@/components/MeasurementCanvas';

// Dynamic import for react-konva (SSR issue)
const MeasurementCanvas = dynamic(() => import('@/components/MeasurementCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-900/50">
      <p className="text-gray-400">Ładowanie canvas...</p>
    </div>
  ),
});

const STORAGE_KEY = 'przedmiarai_project';

interface ProjectData {
  imageDataUrl: string | null;
  measurements: Measurement[];
  scale: number;
}

export default function ProjectEditor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'measure'>('select');
  const [scale, setScale] = useState(100); // pixels per meter (default)
  const [showCalibration, setShowCalibration] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedRooms, setDetectedRooms] = useState<DetectedRoom[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: ProjectData = JSON.parse(saved);
        if (data.imageDataUrl) setImageUrl(data.imageDataUrl);
        if (data.measurements) setMeasurements(data.measurements);
        if (data.scale) setScale(data.scale);
      } catch (e) {
        console.error('Failed to load project data:', e);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    const data: ProjectData = {
      imageDataUrl: imageUrl,
      measurements,
      scale,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [imageUrl, measurements, scale]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();

    // DWG files — not supported yet
    if (name.endsWith('.dwg') || name.endsWith('.dxf')) {
      alert(
        'Format DWG/DXF nie jest jeszcze obsługiwany.\nWyeksportuj rysunek do PDF lub PNG w swoim programie CAD.'
      );
      return;
    }

    // PDF — render first page to image via pdf.js
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 }); // 2x for quality

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        setImageUrl(dataUrl);
        setMeasurements([]);
        setSelectedId(null);
      } catch (err) {
        console.error('PDF rendering failed:', err);
        alert('Nie udało się wczytać pliku PDF. Spróbuj wyeksportować go jako PNG.');
      }
      return;
    }

    // Images — create data URL
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
          setMeasurements([]);
          setSelectedId(null);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    alert('Nieobsługiwany format pliku.\nWspierane formaty: PDF, PNG, JPG.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDelete = (id: string) => {
    setMeasurements(measurements.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleRename = (id: string, name: string) => {
    setMeasurements(
      measurements.map((m) => (m.id === id ? { ...m, name } : m))
    );
  };

  const exportToCSV = () => {
    const headers = ['Nazwa', 'Powierzchnia (m²)'];
    const rows = measurements.map((m) => [m.name, m.areaM2.toFixed(2)]);
    const totalArea = measurements.reduce((sum, m) => sum + m.areaM2, 0);
    rows.push(['SUMA', totalArea.toFixed(2)]);

    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `przedmiar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearProject = () => {
    if (confirm('Czy na pewno chcesz wyczyścić projekt?')) {
      setImageUrl(null);
      setMeasurements([]);
      setSelectedId(null);
      setDetectedRooms([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleRoomsDetected = (rooms: DetectedRoom[]) => {
    setDetectedRooms(rooms);
  };

  const approveRoom = (room: DetectedRoom) => {
    // Convert % coordinates to pixel coordinates on the rendered image
    // We need the image dimensions — load them from imageUrl
    const img = new window.Image();
    img.src = imageUrl!;
    img.onload = () => {
      // Recreate the same scaling logic as MeasurementCanvas
      const container = document.querySelector('.w-full.h-full.bg-neutral-900\\/50');
      const stageW = container?.clientWidth || 800;
      const stageH = container?.clientHeight || 600;
      const scaleX = stageW / img.width;
      const scaleY = stageH / img.height;
      const imgScale = Math.min(scaleX, scaleY, 1);
      const imgX = (stageW - img.width * imgScale) / 2;
      const imgY = (stageH - img.height * imgScale) / 2;

      const x = imgX + (room.x / 100) * img.width * imgScale;
      const y = imgY + (room.y / 100) * img.height * imgScale;
      const width = (room.width / 100) * img.width * imgScale;
      const height = (room.height / 100) * img.height * imgScale;

      const newMeasurement: Measurement = {
        id: `m_${Date.now()}`,
        name: room.name,
        x,
        y,
        width,
        height,
        areaM2: scale > 0 ? (width / scale) * (height / scale) : 0,
      };

      setMeasurements(prev => [...prev, newMeasurement]);
      setDetectedRooms(prev => prev.filter(r => r.id !== room.id));
    };
  };

  const approveAllRooms = () => {
    const img = new window.Image();
    img.src = imageUrl!;
    img.onload = () => {
      const container = document.querySelector('.w-full.h-full.bg-neutral-900\\/50');
      const stageW = container?.clientWidth || 800;
      const stageH = container?.clientHeight || 600;
      const scaleX = stageW / img.width;
      const scaleY = stageH / img.height;
      const imgScale = Math.min(scaleX, scaleY, 1);
      const imgX = (stageW - img.width * imgScale) / 2;
      const imgY = (stageH - img.height * imgScale) / 2;

      const newMeasurements = detectedRooms.map((room, i) => {
        const x = imgX + (room.x / 100) * img.width * imgScale;
        const y = imgY + (room.y / 100) * img.height * imgScale;
        const width = (room.width / 100) * img.width * imgScale;
        const height = (room.height / 100) * img.height * imgScale;

        return {
          id: `m_${Date.now()}_${i}`,
          name: room.name,
          x,
          y,
          width,
          height,
          areaM2: scale > 0 ? (width / scale) * (height / scale) : 0,
        };
      });

      setMeasurements(prev => [...prev, ...newMeasurements]);
      setDetectedRooms([]);
    };
  };

  const rejectRoom = (roomId: string) => {
    setDetectedRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const rejectAllRooms = () => {
    setDetectedRooms([]);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="p-2 hover:bg-[var(--card-bg)] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">Edytor przedmiaru</h1>
              <p className="text-sm text-gray-400">
                {imageUrl ? 'Zaznacz obszary do pomiaru' : 'Wgraj rysunek'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {measurements.length > 0 && (
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center gap-2 !py-2 !px-4"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
            {imageUrl && (
              <button
                onClick={clearProject}
                className="text-sm text-gray-400 hover:text-red-400 transition px-3"
              >
                Nowy projekt
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Canvas area */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 p-1 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]">
              <button
                onClick={() => setTool('select')}
                title="Wybierz (przesuń/zmień rozmiar)"
                className={`p-2 rounded-md transition ${
                  tool === 'select'
                    ? 'bg-violet-500 text-white'
                    : 'hover:bg-[var(--background)]'
                }`}
              >
                <MousePointer2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool('measure')}
                title="Mierz (rysuj prostokąt)"
                className={`p-2 rounded-md transition ${
                  tool === 'measure'
                    ? 'bg-violet-500 text-white'
                    : 'hover:bg-[var(--background)]'
                }`}
              >
                <Ruler className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]">
              <button
                title="Powiększ (coming soon)"
                className="p-2 rounded-md hover:bg-[var(--background)] transition opacity-50 cursor-not-allowed"
                disabled
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                title="Pomniejsz (coming soon)"
                className="p-2 rounded-md hover:bg-[var(--background)] transition opacity-50 cursor-not-allowed"
                disabled
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowCalibration(true)}
              className="flex items-center gap-2 p-2 px-4 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] hover:border-violet-500/50 transition text-sm"
            >
              <Settings className="w-4 h-4" />
              Skala: {scale.toFixed(0)} px/m
            </button>

            <AnalyzeButton
              imageUrl={imageUrl}
              onRoomsDetected={handleRoomsDetected}
            />
          </div>

          {/* Canvas */}
          <div
            className={`flex-1 card p-0 overflow-hidden relative ${
              isDragging ? 'border-violet-500' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {!imageUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/30">
                    <Upload className="w-10 h-10 text-violet-400" />
                  </div>
                  <p className="text-gray-400 mb-2">Przeciągnij plik PDF, PNG lub JPG</p>
                  <p className="text-gray-500 text-sm mb-4">lub</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary !py-2 !px-4"
                  >
                    Wybierz plik
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-gray-600 text-xs mt-4">
                    Obsługiwane: PDF, PNG, JPG &middot; DWG wkrótce
                  </p>
                </div>
              </div>
            ) : (
              <MeasurementCanvas
                imageUrl={imageUrl}
                measurements={measurements}
                onMeasurementsChange={setMeasurements}
                selectedId={selectedId}
                onSelect={setSelectedId}
                tool={tool}
                scale={scale}
                detectedRooms={detectedRooms}
              />
            )}
          </div>

          {/* Instructions */}
          {imageUrl && (
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
              <span>
                <strong>Mierz:</strong> kliknij i przeciągnij aby zaznaczyć obszar
              </span>
              <span>
                <strong>Wybierz:</strong> przeciągaj i skaluj istniejące pomiary
              </span>
            </div>
          )}
        </div>

        {/* Right panel - measurements */}
        <aside className="w-80 border-l border-[var(--card-border)] p-6 overflow-y-auto">
          {/* AI Detected rooms panel */}
          {detectedRooms.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg text-green-400">AI Wykryte</h2>
                <span className="text-xs text-gray-400">{detectedRooms.length} pomieszczeń</span>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={approveAllRooms}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-xs text-green-400 transition"
                >
                  <Check className="w-3 h-3" />
                  Zatwierdź wszystkie
                </button>
                <button
                  onClick={rejectAllRooms}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-xs text-red-400 transition"
                >
                  <X className="w-3 h-3" />
                  Odrzuć wszystkie
                </button>
              </div>

              <div className="space-y-2">
                {detectedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-2 bg-green-500/5 border border-green-500/20 rounded-lg"
                  >
                    <span className="text-sm text-green-300">{room.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => approveRoom(room)}
                        title="Zatwierdź"
                        className="p-1 hover:bg-green-500/20 rounded transition"
                      >
                        <Check className="w-4 h-4 text-green-400" />
                      </button>
                      <button
                        onClick={() => rejectRoom(room.id)}
                        title="Odrzuć"
                        className="p-1 hover:bg-red-500/20 rounded transition"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-b border-[var(--card-border)]" />
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-1">Pomiary</h2>
            <p className="text-sm text-gray-400">
              {measurements.length} {measurements.length === 1 ? 'obszar' : 'obszarów'}
            </p>
          </div>

          <MeasurementList
            measurements={measurements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </aside>
      </div>

      {/* Scale calibration modal */}
      <ScaleCalibration
        scale={scale}
        onScaleChange={setScale}
        isOpen={showCalibration}
        onClose={() => setShowCalibration(false)}
      />
    </div>
  );
}
