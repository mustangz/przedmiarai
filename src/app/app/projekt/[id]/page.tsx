'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Upload,
  MousePointer2,
  Ruler,
  Download,
  Trash2,
  Calculator,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
  Loader2
} from 'lucide-react';

interface Measurement {
  id: string;
  name: string;
  area: number;
  perimeter: number;
  bounds: { x: number; y: number; width: number; height: number };
}

export default function ProjectEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'select' | 'measure'>('select');
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.includes('pdf') || droppedFile.type.includes('image'))) {
      setFile(droppedFile);
      setImageUrl(URL.createObjectURL(droppedFile));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const analyzeImage = async () => {
    if (!imageUrl) return;
    
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      
      const data = await res.json();
      if (data.success) {
        setMeasurements(data.rooms);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalArea = measurements.reduce((sum, m) => sum + m.area, 0);

  const deleteMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
    if (selectedMeasurement === id) {
      setSelectedMeasurement(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nazwa', 'Powierzchnia (m²)', 'Obwód (m)'];
    const rows = measurements.map(m => [m.name, m.area.toFixed(2), m.perimeter.toFixed(2)]);
    rows.push(['SUMA', totalArea.toFixed(2), '']);
    
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'przedmiar.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app" className="p-2 hover:bg-[var(--card-bg)] rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">Nowy projekt</h1>
              <p className="text-sm text-gray-400">Edytor przedmiaru</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {measurements.length > 0 && (
              <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 !py-2 !px-4">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
            <button className="btn-primary flex items-center gap-2 !py-2 !px-4">
              <FileSpreadsheet className="w-4 h-4" />
              Zapisz
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Canvas area */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 p-1 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]">
              <button 
                onClick={() => setSelectedTool('select')}
                className={`p-2 rounded-md transition ${selectedTool === 'select' ? 'bg-violet-500 text-white' : 'hover:bg-[var(--background)]'}`}
              >
                <MousePointer2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setSelectedTool('measure')}
                className={`p-2 rounded-md transition ${selectedTool === 'measure' ? 'bg-violet-500 text-white' : 'hover:bg-[var(--background)]'}`}
              >
                <Ruler className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-1 p-1 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]">
              <button className="p-2 rounded-md hover:bg-[var(--background)] transition">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-md hover:bg-[var(--background)] transition">
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {imageUrl && (
              <button 
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="btn-primary !py-2 !px-4 flex items-center gap-2 ml-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analizuję...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    Analizuj AI
                  </>
                )}
              </button>
            )}
          </div>

          {/* Canvas */}
          <div 
            className={`flex-1 card p-0 overflow-hidden relative ${isDragging ? 'border-violet-500' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {!imageUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/30">
                    <Upload className="w-10 h-10 text-violet-400" />
                  </div>
                  <p className="text-gray-400 mb-2">Przeciągnij plik PDF lub PNG</p>
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
                </div>
              </div>
            ) : (
              <div className="absolute inset-0">
                {/* Image display */}
                <div className="w-full h-full flex items-center justify-center bg-neutral-900/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imageUrl} 
                    alt="Rysunek techniczny" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                {/* Measurement overlays */}
                {measurements.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeasurement(m.id)}
                    style={{
                      position: 'absolute',
                      left: `${m.bounds.x}px`,
                      top: `${m.bounds.y}px`,
                      width: `${m.bounds.width}px`,
                      height: `${m.bounds.height}px`,
                    }}
                    className={`border-2 cursor-pointer transition-all ${
                      selectedMeasurement === m.id 
                        ? 'border-violet-500 bg-violet-500/20' 
                        : 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20'
                    }`}
                  >
                    <div className="absolute -top-6 left-0 bg-violet-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {m.name}: {m.area.toFixed(1)} m²
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel - measurements */}
        <aside className="w-80 border-l border-[var(--card-border)] p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-1">Pomiary</h2>
            <p className="text-sm text-gray-400">Lista wykrytych powierzchni</p>
          </div>

          {measurements.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Ruler className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Brak pomiarów</p>
              <p className="text-xs">Wgraj rysunek i kliknij &quot;Analizuj AI&quot;</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {measurements.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => setSelectedMeasurement(m.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedMeasurement === m.id 
                        ? 'bg-violet-500/20 border border-violet-500' 
                        : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-violet-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{m.name}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteMeasurement(m.id); }}
                        className="p-1 hover:bg-red-500/20 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Pow.:</span>
                        <span className="ml-1 font-medium">{m.area.toFixed(2)} m²</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Obw.:</span>
                        <span className="ml-1">{m.perimeter.toFixed(2)} m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
                <div className="text-sm text-gray-400 mb-1">Suma powierzchni</div>
                <div className="text-2xl font-bold gradient-text">{totalArea.toFixed(2)} m²</div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
