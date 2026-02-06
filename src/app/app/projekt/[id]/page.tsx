'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MeasurementList from '@/components/MeasurementList';
import ScaleCalibration from '@/components/ScaleCalibration';
import AnalyzeButton from '@/components/AnalyzeButton';
import type { AnalysisResult } from '@/components/AnalyzeButton';
import type { Measurement, DetectedRoom } from '@/components/MeasurementCanvas';

// ─── Inline SVG icons ─────────────────────────────────────────
const Icons = {
  Calculator: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" />
      <path d="M12 14h.01" /><path d="M8 14h.01" />
      <path d="M12 18h.01" /><path d="M8 18h.01" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  ),
  MousePointer: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 4 7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  ),
  Ruler: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
    </svg>
  ),
  ZoomIn: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="11" x2="11" y1="8" y2="14" /><line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  ),
  ZoomOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
};

// Dynamic import for react-konva (SSR issue)
const MeasurementCanvas = dynamic(() => import('@/components/MeasurementCanvas'), {
  ssr: false,
  loading: () => (
    <div className="app-canvas-loading">
      <p>Ładowanie canvas...</p>
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [buildingOutline, setBuildingOutline] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [floorName, setFloorName] = useState<string | null>(null);
  const [aiScale, setAiScale] = useState<{ label: string; estimatedPxPerM: number | null } | null>(null);
  const [tableRooms, setTableRooms] = useState<{ name: string; areaMFromTable: number }[] | null>(null);
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
      setBuildingOutline(null);
      setFloorName(null);
      setAiScale(null);
      setTableRooms(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setDetectedRooms(result.rooms);
    setBuildingOutline(result.outline);
    setFloorName(result.floorName);
    setAiScale(result.scale);
    setTableRooms(result.tableRooms);
  };

  const approveRoom = (room: DetectedRoom) => {
    const img = new window.Image();
    img.src = imageUrl!;
    img.onload = () => {
      const container = document.querySelector('.app-canvas-loading')?.parentElement || document.querySelector('.app-canvas');
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
      const container = document.querySelector('.app-canvas-loading')?.parentElement || document.querySelector('.app-canvas');
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
    <div className="app-editor">
      {/* Header — navbar style */}
      <header className="app-editor-header">
        <div className="app-editor-header-inner">
          <div className="app-editor-header-left">
            <Link href="/app" className="app-editor-back">
              <Icons.ArrowLeft />
            </Link>
            <div>
              <div className="app-editor-title">Edytor przedmiaru</div>
              <div className="app-editor-subtitle">
                {imageUrl ? 'Zaznacz obszary do pomiaru' : 'Wgraj rysunek'}
              </div>
            </div>
          </div>

          <div className="app-editor-actions">
            {measurements.length > 0 && (
              <button
                type="button"
                onClick={exportToCSV}
                className="panel-action-btn primary"
              >
                <Icons.Download />
                Export CSV
              </button>
            )}
            {imageUrl && (
              <button
                type="button"
                onClick={clearProject}
                className="panel-action-btn"
              >
                Nowy projekt
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-editor-body">
        {/* Canvas area */}
        <div className="app-canvas-area">
          {/* Toolbar */}
          <div className="app-toolbar">
            <div className="app-toolbar-group">
              <button
                type="button"
                onClick={() => setTool('select')}
                title="Wybierz (przesuń/zmień rozmiar)"
                className={`app-toolbar-btn ${tool === 'select' ? 'active' : ''}`}
              >
                <Icons.MousePointer />
              </button>
              <button
                type="button"
                onClick={() => setTool('measure')}
                title="Mierz (rysuj prostokąt)"
                className={`app-toolbar-btn ${tool === 'measure' ? 'active' : ''}`}
              >
                <Icons.Ruler />
              </button>
            </div>

            <div className="app-toolbar-group">
              <button
                type="button"
                title="Powiększ (coming soon)"
                className="app-toolbar-btn"
                disabled
              >
                <Icons.ZoomIn />
              </button>
              <button
                type="button"
                title="Pomniejsz (coming soon)"
                className="app-toolbar-btn"
                disabled
              >
                <Icons.ZoomOut />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCalibration(true)}
              className="app-toolbar-scale"
            >
              <Icons.Settings />
              Skala: {scale.toFixed(0)} px/m
            </button>

            <AnalyzeButton
              imageUrl={imageUrl}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>

          {/* Canvas */}
          <div
            className={`app-canvas ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {!imageUrl ? (
              <div className="app-canvas-dropzone">
                <div className="app-canvas-dropzone-inner">
                  <div className="app-canvas-dropzone-icon">
                    <Icons.Upload />
                  </div>
                  <p className="app-canvas-dropzone-title">Przeciągnij plik PDF, PNG lub JPG</p>
                  <p className="app-canvas-dropzone-hint">lub</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="panel-action-btn"
                  >
                    Wybierz plik
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="panel-hidden"
                  />
                  <p className="app-canvas-dropzone-formats">
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
                hoveredId={hoveredId}
                buildingOutline={buildingOutline}
              />
            )}
          </div>

          {/* Instructions */}
          {imageUrl && (
            <div className="app-canvas-instructions">
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
        <aside className="app-editor-sidebar">
          {/* AI metadata info bar */}
          {(floorName || aiScale) && (
            <div className="app-ai-meta">
              {floorName && (
                <div className="app-ai-meta-item">
                  <span className="app-ai-meta-label">Kondygnacja</span>
                  <span className="app-ai-meta-value">{floorName}</span>
                </div>
              )}
              {aiScale && (
                <div className="app-ai-meta-item">
                  <span className="app-ai-meta-label">Skala</span>
                  <span className="app-ai-meta-value">{aiScale.label}</span>
                </div>
              )}
            </div>
          )}

          {/* AI Detected rooms panel */}
          {detectedRooms.length > 0 && (
            <div className="app-ai-panel">
              <div className="app-ai-header">
                <span className="app-ai-title">AI Wykryte</span>
                <span className="app-ai-count">{detectedRooms.length} pomieszczeń</span>
              </div>

              <div className="app-ai-bulk-actions">
                <button type="button" onClick={approveAllRooms} className="app-ai-approve-all">
                  <Icons.Check />
                  Zatwierdź wszystkie
                </button>
                <button type="button" onClick={rejectAllRooms} className="app-ai-reject-all">
                  <Icons.X />
                  Odrzuć wszystkie
                </button>
              </div>

              <div className="app-ai-rooms">
                {detectedRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`app-ai-room ${hoveredId === room.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredId(room.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="app-ai-room-info">
                      <span className="app-ai-room-name">{room.name}</span>
                      {room.areaMFromTable && (
                        <span className="app-ai-room-area">{room.areaMFromTable} m²</span>
                      )}
                    </div>
                    <div className="app-ai-room-actions">
                      <button
                        type="button"
                        onClick={() => approveRoom(room)}
                        title="Zatwierdź"
                        className="app-ai-room-btn approve"
                      >
                        <Icons.Check />
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectRoom(room.id)}
                        title="Odrzuć"
                        className="app-ai-room-btn reject"
                      >
                        <Icons.X />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table rooms cross-reference */}
              {tableRooms && tableRooms.length > 0 && (
                <div className="app-ai-table-ref">
                  <span className="app-ai-table-ref-title">Tabela pomieszczeń</span>
                  {tableRooms.map((tr, i) => (
                    <div key={i} className="app-ai-table-ref-item">
                      <span className="app-ai-table-ref-name">{tr.name}</span>
                      <span className="app-ai-table-ref-area">{tr.areaMFromTable} m²</span>
                    </div>
                  ))}
                </div>
              )}

              <hr className="app-ai-divider" />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div className="app-editor-sidebar-title">Pomiary</div>
            <div className="app-editor-sidebar-count">
              {measurements.length} {measurements.length === 1 ? 'obszar' : 'obszarów'}
            </div>
          </div>

          <MeasurementList
            measurements={measurements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDelete}
            onRename={handleRename}
            hoveredId={hoveredId}
            onHover={setHoveredId}
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
