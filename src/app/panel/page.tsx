'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Loader2,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Table,
  Eye,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────
interface PozycjaPrzedmiaru {
  lp: string;
  podstawa: string;
  opis: string;
  jednostka: string;
  ilosc: string;
  uwagi: string;
}

type AppState = 'upload' | 'preview' | 'analyzing' | 'results';

// ─── PDF → Images helper ────────────────────────────────────
async function pdfToImages(file: File): Promise<string[]> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;
    images.push(canvas.toDataURL('image/jpeg', 0.85));
  }

  return images;
}

// ─── Excel Export ───────────────────────────────────────────
async function exportToExcel(pozycje: PozycjaPrzedmiaru[], fileName: string) {
  const XLSX = await import('xlsx');
  const data = pozycje.map((p) => ({
    'L.p.': p.lp,
    'Podstawa': p.podstawa,
    'Opis robót': p.opis,
    'Jednostka': p.jednostka,
    'Ilość': p.ilosc,
    'Uwagi': p.uwagi,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 60 },
    { wch: 10 },
    { wch: 12 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Przedmiar');
  XLSX.writeFile(wb, fileName);
}

// ─── Main Component ─────────────────────────────────────────
export default function PanelPage() {
  const [state, setState] = useState<AppState>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pozycje, setPozycje] = useState<PozycjaPrzedmiaru[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [usage, setUsage] = useState<{ input_tokens: number; output_tokens: number } | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback(async (f: File) => {
    setError(null);

    if (f.type !== 'application/pdf') {
      setError('Obsługiwany format to PDF. Wybierz plik PDF.');
      return;
    }

    if (f.size > 50 * 1024 * 1024) {
      setError('Plik jest za duży. Maksymalny rozmiar to 50 MB.');
      return;
    }

    setFile(f);
    setProgress('Przetwarzanie PDF...');
    setState('preview');

    try {
      const images = await pdfToImages(f);
      setPageImages(images);
      setCurrentPage(0);
      setProgress('');
    } catch (err) {
      console.error('PDF processing error:', err);
      setError('Nie udało się przetworzyć pliku PDF. Spróbuj inny plik.');
      setState('upload');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const analyze = useCallback(async () => {
    if (pageImages.length === 0) return;

    setState('analyzing');
    setError(null);
    setProgress(`Analizuję ${pageImages.length} stron...`);
    setAnalyzeProgress(0);

    try {
      const BATCH_SIZE = 10;
      const allPozycje: PozycjaPrzedmiaru[] = [];
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      for (let i = 0; i < pageImages.length; i += BATCH_SIZE) {
        const batch = pageImages.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(pageImages.length / BATCH_SIZE);

        setAnalyzeProgress(Math.round((i / pageImages.length) * 100));

        if (totalBatches > 1) {
          setProgress(`Partia ${batchNum}/${totalBatches}`);
        }

        const res = await fetch('/api/analyze-przedmiar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pages: batch }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Błąd analizy');
        }

        if (data.pozycje) {
          allPozycje.push(...data.pozycje);
        }
        if (data.usage) {
          totalInputTokens += data.usage.input_tokens;
          totalOutputTokens += data.usage.output_tokens;
        }
      }

      setPozycje(allPozycje);
      setUsage({ input_tokens: totalInputTokens, output_tokens: totalOutputTokens });
      setAnalyzeProgress(100);
      setState('results');
      setProgress('');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Błąd analizy przedmiaru');
      setState('preview');
      setProgress('');
    }
  }, [pageImages]);

  const reset = useCallback(() => {
    setFile(null);
    setPageImages([]);
    setPozycje([]);
    setError(null);
    setProgress('');
    setUsage(null);
    setCurrentPage(0);
    setAnalyzeProgress(0);
    setState('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleExport = useCallback(() => {
    if (pozycje.length === 0) return;
    const baseName = file?.name?.replace(/\.pdf$/i, '') || 'przedmiar';
    exportToExcel(pozycje, `${baseName}_analiza.xlsx`);
  }, [pozycje, file]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (state !== 'preview' && state !== 'results') return;
      if (e.key === 'ArrowLeft') setCurrentPage((p) => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, pageImages.length]);

  const dataRows = pozycje.filter((p) => p.jednostka || p.ilosc);
  const isProcessingPdf = state === 'preview' && pageImages.length === 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
      {/* Subtle radial glow - same as LP */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.12)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Navbar - exact LP style */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 py-3.5 bg-[rgba(9,9,11,0.85)] backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
              <FileSpreadsheet size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight">PrzedmiarAI</span>
          </a>
          {state === 'results' && (
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#e4e4e7] text-[#09090b] text-[13px] font-semibold rounded-lg transition-all"
            >
              <Download size={14} />
              Eksport Excel
            </button>
          )}
        </div>
      </nav>

      <main className="relative pt-[120px] sm:pt-[140px] pb-16 px-5 sm:px-8 min-h-screen">
        <div className="max-w-[1120px] mx-auto">

          {/* ═══════════════════════════════════════════════════════════
              UPLOAD STATE
          ═══════════════════════════════════════════════════════════ */}
          {state === 'upload' && (
            <div className="max-w-xl mx-auto pt-8 sm:pt-16">
              {/* Header - LP style */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-full text-xs font-semibold text-[#a78bfa] tracking-wide mb-7">
                  <Sparkles size={12} />
                  AI Analiza
                </div>
                <h1 className="text-[clamp(28px,7vw,48px)] font-extrabold tracking-[-0.035em] leading-[1.08] mb-5">
                  Wgraj przedmiar <span className="bg-gradient-to-br from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">PDF</span>
                </h1>
                <p className="text-[clamp(15px,3.5vw,17px)] text-[#a1a1aa] max-w-[480px] mx-auto leading-relaxed">
                  AI wyciągnie wszystkie pozycje, ilości i jednostki. Wyeksportujesz do Excela jednym klikiem.
                </p>
              </div>

              {/* Drop Zone - LP hero-card style */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl p-7 sm:p-10 transition-all duration-200 backdrop-blur-lg ${
                  dragActive 
                    ? 'bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.3)]' 
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-200 ${
                    dragActive 
                      ? 'bg-[rgba(139,92,246,0.15)]' 
                      : 'bg-[rgba(139,92,246,0.1)]'
                  }`}>
                    <Upload size={24} className={`transition-colors ${dragActive ? 'text-[#a78bfa]' : 'text-[#a78bfa]'}`} />
                  </div>
                  
                  {/* Text */}
                  <p className="text-lg font-semibold mb-2">
                    {dragActive ? 'Upuść plik tutaj' : 'Przeciągnij PDF lub kliknij'}
                  </p>
                  <p className="text-sm text-[#a1a1aa] mb-5">
                    Przedmiar budowlany w formacie PDF, do 50 MB
                  </p>
                  
                  {/* CTA Button - LP style */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 w-full max-w-[280px] py-3.5 px-6 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] hover:shadow-[0_4px_24px_rgba(139,92,246,0.5)] text-white font-bold text-[15px] rounded-xl transition-all shadow-[0_2px_16px_rgba(139,92,246,0.3)]"
                  >
                    <Upload size={18} />
                    Wybierz plik PDF
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Progress */}
              {progress && (
                <div className="mt-6 flex items-center justify-center gap-3 text-violet-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  {progress}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              PREVIEW STATE
          ═══════════════════════════════════════════════════════════ */}
          {state === 'preview' && (
            <div className="pb-24 lg:pb-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* PDF Preview */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                    {/* Page nav */}
                    {pageImages.length > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/10">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={18} className="text-white/70" />
                        </button>
                        <span className="text-sm text-white/50 font-medium">
                          {currentPage + 1} / {pageImages.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1))}
                          disabled={currentPage === pageImages.length - 1}
                          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={18} className="text-white/70" />
                        </button>
                      </div>
                    )}
                    {/* Image */}
                    <div className="p-4 sm:p-6 bg-[#0f0f10]">
                      {pageImages[currentPage] ? (
                        <img
                          src={pageImages[currentPage]}
                          alt={`Strona ${currentPage + 1}`}
                          className="max-w-full max-h-[70vh] mx-auto object-contain rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center py-32">
                          <Loader2 size={24} className="text-violet-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar - Desktop */}
                <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
                  {/* File info */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <FileText size={22} className="text-violet-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white text-sm truncate">{file?.name}</p>
                        <p className="text-xs text-white/40">
                          {pageImages.length} {pageImages.length === 1 ? 'strona' : 'stron'} · {file ? (file.size / 1024 / 1024).toFixed(1) : 0} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={analyze}
                      disabled={isProcessingPdf}
                      className="w-full relative group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className={`relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${
                        isProcessingPdf 
                          ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white'
                      }`}>
                        {isProcessingPdf ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Sparkles size={18} />
                        )}
                        {isProcessingPdf ? 'Ładowanie...' : 'Analizuj AI'}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={reset}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                      Usuń plik
                    </button>
                  </div>

                  {/* Tips */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Jak to działa</p>
                    <div className="space-y-3 text-sm text-white/50">
                      <div className="flex gap-3">
                        <span className="text-violet-400 font-mono">1.</span>
                        <span>AI czyta każdą stronę</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-violet-400 font-mono">2.</span>
                        <span>Wyciąga pozycje i ilości</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-violet-400 font-mono">3.</span>
                        <span>Eksportujesz do Excela</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Bottom Bar */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0b]/95 backdrop-blur-xl border-t border-white/10 z-50">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="p-3.5 text-white/40 border border-white/10 rounded-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={analyze}
                    disabled={isProcessingPdf}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                      isProcessingPdf 
                        ? 'bg-white/10 text-white/50' 
                        : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                    }`}
                  >
                    {isProcessingPdf ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {isProcessingPdf ? 'Ładowanie...' : 'Analizuj AI'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              ANALYZING STATE
          ═══════════════════════════════════════════════════════════ */}
          {state === 'analyzing' && (
            <div className="max-w-lg mx-auto pt-16 text-center">
              {/* Progress ring */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${analyzeProgress * 3.52} 352`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{analyzeProgress}%</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">Analizuję przedmiar</h2>
              <p className="text-white/50 mb-8">
                AI czyta {pageImages.length} {pageImages.length === 1 ? 'stronę' : 'stron'} i wyciąga pozycje
              </p>

              {progress && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60">
                  <Loader2 size={14} className="animate-spin text-violet-400" />
                  {progress}
                </div>
              )}

              {/* Page thumbnails */}
              <div className="mt-10 flex justify-center gap-1.5 flex-wrap max-w-sm mx-auto">
                {pageImages.slice(0, 10).map((img, i) => (
                  <div
                    key={i}
                    className={`w-10 h-14 rounded-md overflow-hidden border transition-all duration-300 ${
                      i < Math.ceil((analyzeProgress / 100) * pageImages.length)
                        ? 'border-violet-500/50 opacity-100'
                        : 'border-white/10 opacity-30'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {pageImages.length > 10 && (
                  <div className="w-10 h-14 rounded-md border border-white/10 flex items-center justify-center text-xs text-white/30">
                    +{pageImages.length - 10}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              RESULTS STATE
          ═══════════════════════════════════════════════════════════ */}
          {state === 'results' && (
            <div>
              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span className="font-semibold text-white">Analiza zakończona</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>{dataRows.length} pozycji</span>
                  <span>·</span>
                  <span>{pageImages.length} stron</span>
                  {usage && (
                    <>
                      <span>·</span>
                      <span>{((usage.input_tokens + usage.output_tokens) * 0.000003 * 4.2).toFixed(2)} PLN</span>
                    </>
                  )}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setState('preview')}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                  >
                    <Eye size={14} />
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                  >
                    <Upload size={14} />
                    Nowy
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Download size={14} />
                    Excel
                  </button>
                </div>
              </div>

              {/* Results table */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 bg-white/[0.02] border-b border-white/10">
                  <Table size={16} className="text-violet-400" />
                  <span className="text-sm font-medium text-white/70">Pozycje przedmiaru</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider w-[60px]">L.p.</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider w-[140px]">Podstawa</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider min-w-[280px]">Opis robót</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider w-[70px]">Jedn.</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider w-[90px] text-right">Ilość</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider min-w-[140px]">Uwagi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pozycje.map((p, i) => {
                        const isSection = !p.jednostka && !p.ilosc && p.opis;
                        return (
                          <tr
                            key={i}
                            className={`border-b border-white/5 transition-colors ${
                              isSection
                                ? 'bg-violet-500/5'
                                : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            <td className={`px-5 py-3 ${isSection ? 'font-semibold text-violet-400' : 'text-white/40'}`}>
                              {p.lp}
                            </td>
                            <td className="px-5 py-3 text-white/40 font-mono text-xs">
                              {p.podstawa}
                            </td>
                            <td className={`px-5 py-3 ${isSection ? 'font-semibold text-violet-300 uppercase text-xs tracking-wide' : 'text-white/80'}`}>
                              {p.opis}
                            </td>
                            <td className="px-5 py-3 text-white/40 text-center">
                              {p.jednostka}
                            </td>
                            <td className="px-5 py-3 text-right font-mono font-medium text-white">
                              {p.ilosc}
                            </td>
                            <td className="px-5 py-3 text-white/30 text-xs">
                              {p.uwagi}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {pozycje.length === 0 && (
                  <div className="px-6 py-20 text-center text-white/40">
                    <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
                    <p>AI nie znalazł pozycji przedmiarowych</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Global styles for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
