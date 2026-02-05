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
} from 'lucide-react';
import MeasurementList from '@/components/MeasurementList';
import ScaleCalibration from '@/components/ScaleCalibration';
import type { Measurement } from '@/components/MeasurementCanvas';

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
    if (file && (file.type.includes('image') || file.type.includes('pdf'))) {
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    // For images, create data URL
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
          setMeasurements([]); // Reset measurements for new image
          setSelectedId(null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // PDF - for now just show message (would need pdf.js)
      alert('PDF support coming soon! For now, export your PDF as PNG.');
    }
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
      localStorage.removeItem(STORAGE_KEY);
    }
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
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/30">
                    <Upload className="w-10 h-10 text-violet-400" />
                  </div>
                  <p className="text-gray-400 mb-2">Przeciągnij plik PNG lub JPG</p>
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
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
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
        <aside className="w-80 border-l border-[var(--card-border)] p-6">
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
