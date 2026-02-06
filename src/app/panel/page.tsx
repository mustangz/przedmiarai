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
    const scale = 1.5; // good quality for OCR, manageable file size
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

  // Column widths
  ws['!cols'] = [
    { wch: 8 },   // L.p.
    { wch: 20 },  // Podstawa
    { wch: 60 },  // Opis
    { wch: 10 },  // Jednostka
    { wch: 12 },  // Ilość
    { wch: 30 },  // Uwagi
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop handlers
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

  // Analysis
  const analyze = useCallback(async () => {
    if (pageImages.length === 0) return;

    setState('analyzing');
    setError(null);
    setProgress(`Analizuję ${pageImages.length} stron...`);

    try {
      // For large documents, process in batches of 10 pages
      const BATCH_SIZE = 10;
      const allPozycje: PozycjaPrzedmiaru[] = [];
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      for (let i = 0; i < pageImages.length; i += BATCH_SIZE) {
        const batch = pageImages.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(pageImages.length / BATCH_SIZE);

        if (totalBatches > 1) {
          setProgress(`Analizuję partię ${batchNum}/${totalBatches} (strony ${i + 1}-${Math.min(i + BATCH_SIZE, pageImages.length)})...`);
        } else {
          setProgress(`Analizuję ${pageImages.length} stron...`);
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
    setState('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleExport = useCallback(() => {
    if (pozycje.length === 0) return;
    const baseName = file?.name?.replace(/\.pdf$/i, '') || 'przedmiar';
    exportToExcel(pozycje, `${baseName}_analiza.xlsx`);
  }, [pozycje, file]);

  // Keyboard navigation for preview
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (state !== 'preview' && state !== 'results') return;
      if (e.key === 'ArrowLeft') setCurrentPage((p) => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, pageImages.length]);

  // Count actual data rows (not section headers)
  const dataRows = pozycje.filter((p) => p.jednostka || p.ilosc);
  const isProcessingPdf = state === 'preview' && pageImages.length === 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3.5 bg-[#09090b]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight">PrzedmiarAI</span>
          </a>
          {state === 'results' && (
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Download size={16} />
              Eksport Excel
            </button>
          )}
        </div>
      </nav>

      <main className="pt-20 pb-12 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ─── Upload State ──────────────────────── */}
          {state === 'upload' && (
            <div className="max-w-2xl mx-auto mt-8 sm:mt-16">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-semibold text-violet-400 mb-5">
                  <Sparkles size={12} />
                  AI Analiza Przedmiarów
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                  Wgraj przedmiar <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">PDF</span>
                </h1>
                <p className="text-[#a1a1aa] text-base sm:text-lg max-w-md mx-auto">
                  AI wyciągnie wszystkie pozycje, ilości i jednostki. Wyeksportujesz do Excela jednym klikiem.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-16
                  flex flex-col items-center justify-center text-center
                  transition-all duration-300 ease-out
                  ${dragActive
                    ? 'border-violet-500 bg-gradient-to-b from-violet-500/15 to-violet-500/5 scale-[1.02] shadow-xl shadow-violet-500/10'
                    : 'border-white/15 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-violet-500/50 hover:bg-violet-500/5 hover:shadow-lg hover:shadow-violet-500/5'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className={`
                  w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${dragActive 
                    ? 'bg-violet-500/20 scale-110' 
                    : 'bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10'
                  }
                `}>
                  <Upload size={32} className={`transition-colors duration-300 ${dragActive ? 'text-violet-400' : 'text-violet-400/70'}`} />
                </div>
                <p className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {dragActive ? 'Upuść plik tutaj' : 'Przeciągnij PDF lub kliknij'}
                </p>
                <p className="text-sm text-[#71717a]">
                  Przedmiar budowlany w formacie PDF, do 50 MB
                </p>
                <div className="mt-6 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-medium text-violet-400">
                  Obsługujemy skany i pliki cyfrowe
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {progress && (
                <div className="mt-4 flex items-center justify-center gap-3 text-violet-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  {progress}
                </div>
              )}
            </div>
          )}

          {/* ─── Preview State ─────────────────────── */}
          {state === 'preview' && (
            <div className="mt-2 sm:mt-4 pb-24 sm:pb-4">
              {/* Desktop: PDF left + sidebar right */}
              <div className="flex flex-col lg:flex-row gap-5">
                {/* PDF preview area */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                    {/* Page navigation */}
                    {pageImages.length > 1 && (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm text-[#a1a1aa]">
                          Strona {currentPage + 1} z {pageImages.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1))}
                          disabled={currentPage === pageImages.length - 1}
                          className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                    {/* Image */}
                    <div className="p-4 sm:p-6 flex justify-center bg-[#111113]">
                      {pageImages[currentPage] && (
                        <img
                          src={pageImages[currentPage]}
                          alt={`Strona ${currentPage + 1}`}
                          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                        />
                      )}
                      {progress && (
                        <div className="flex items-center gap-3 text-violet-400 text-sm py-20">
                          <Loader2 size={16} className="animate-spin" />
                          {progress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop sidebar */}
                <div className="hidden lg:flex flex-col gap-4 w-[280px] flex-shrink-0">
                  {/* File info */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{file?.name}</p>
                        <p className="text-xs text-[#71717a]">
                          {pageImages.length} {pageImages.length === 1 ? 'strona' : pageImages.length < 5 ? 'strony' : 'stron'}
                          {' · '}
                          {file ? (file.size / 1024 / 1024).toFixed(1) : 0} MB
                        </p>
                      </div>
                    </div>

                    {/* Analyze button */}
                    <button
                      type="button"
                      onClick={analyze}
                      disabled={isProcessingPdf}
                      className={`w-full flex items-center justify-center gap-2.5 py-3 text-white font-bold rounded-xl transition-all ${
                        isProcessingPdf
                          ? 'bg-violet-600/50 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 cursor-pointer shadow-lg shadow-violet-500/25'
                      }`}
                    >
                      {isProcessingPdf ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                      {isProcessingPdf ? 'Ładowanie PDF...' : 'Analizuj AI'}
                    </button>

                    {/* Remove file */}
                    <button
                      type="button"
                      onClick={reset}
                      className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 text-sm text-[#71717a] hover:text-white border border-white/[0.06] hover:border-white/15 rounded-xl transition-colors"
                    >
                      <Trash2 size={14} />
                      Usuń plik
                    </button>
                  </div>

                  {/* Tips */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-xs text-[#71717a] space-y-2">
                    <p className="text-[#a1a1aa] font-semibold text-xs uppercase tracking-wider mb-3">Jak to działa</p>
                    <p>1. AI czyta każdą stronę PDF</p>
                    <p>2. Wyciąga pozycje, ilości, jednostki</p>
                    <p>3. Eksportujesz wynik do Excela</p>
                  </div>
                </div>
              </div>

              {/* Mobile sticky bottom bar */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/10 z-50">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="flex items-center justify-center p-3 text-[#a1a1aa] border border-white/10 rounded-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={analyze}
                    disabled={isProcessingPdf}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 ${
                      isProcessingPdf
                        ? 'bg-violet-600/50 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-violet-600 to-violet-500 cursor-pointer'
                    }`}
                  >
                    {isProcessingPdf ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {isProcessingPdf ? 'Ładowanie PDF...' : 'Analizuj AI'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ─── Analyzing State ───────────────────── */}
          {state === 'analyzing' && (
            <div className="mt-8 sm:mt-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-violet-500/10 mb-6">
                <Loader2 size={36} className="text-violet-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-3">AI analizuje przedmiar</h2>
              <p className="text-[#a1a1aa] mb-6 max-w-md mx-auto">
                Claude czyta każdą stronę i wyciąga pozycje kosztorysowe. To może potrwać do minuty.
              </p>
              {progress && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-400">
                  <Loader2 size={14} className="animate-spin" />
                  {progress}
                </div>
              )}

              {/* Mini preview of pages being analyzed */}
              <div className="mt-10 flex justify-center gap-2 flex-wrap max-w-lg mx-auto">
                {pageImages.slice(0, 12).map((img, i) => (
                  <div key={i} className="w-12 h-16 rounded-md overflow-hidden border border-white/10 opacity-40">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {pageImages.length > 12 && (
                  <div className="w-12 h-16 rounded-md border border-white/10 flex items-center justify-center text-xs text-[#71717a]">
                    +{pageImages.length - 12}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Results State ─────────────────────── */}
          {state === 'results' && (
            <div className="mt-4 sm:mt-6">
              {/* Summary bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <h2 className="text-xl font-bold">Analiza zakończona</h2>
                  </div>
                  <p className="text-sm text-[#71717a]">
                    {dataRows.length} pozycji kosztorysowych
                    {pozycje.length !== dataRows.length && ` · ${pozycje.length - dataRows.length} sekcji`}
                    {' · '}{pageImages.length} stron
                    {usage && ` · ${((usage.input_tokens + usage.output_tokens) * 0.000003 * 4.2).toFixed(2)} PLN`}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setState('preview')}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#a1a1aa] hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                  >
                    <Eye size={15} />
                    Podgląd PDF
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#a1a1aa] hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                  >
                    <Upload size={15} />
                    Nowy plik
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    <Download size={16} />
                    Eksport Excel
                  </button>
                </div>
              </div>

              {/* Results table */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/[0.06]">
                  <Table size={16} className="text-violet-400" />
                  <span className="text-sm font-semibold text-[#a1a1aa]">Pozycje przedmiaru</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left">
                        <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-[#71717a] uppercase tracking-wider w-[60px]">L.p.</th>
                        <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-[#71717a] uppercase tracking-wider w-[160px]">Podstawa</th>
                        <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-[#71717a] uppercase tracking-wider min-w-[300px]">Opis robót</th>
                        <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-[#71717a] uppercase tracking-wider w-[80px]">Jedn.</th>
                        <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-[#71717a] uppercase tracking-wider w-[100px] text-right">Ilość</th>
                        <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-[#71717a] uppercase tracking-wider min-w-[160px]">Uwagi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pozycje.map((p, i) => {
                        const isSection = !p.jednostka && !p.ilosc && p.opis;
                        return (
                          <tr
                            key={i}
                            className={`
                              border-b border-white/[0.03] transition-colors
                              ${isSection
                                ? 'bg-violet-500/[0.04]'
                                : 'hover:bg-white/[0.02]'
                              }
                            `}
                          >
                            <td className={`px-4 sm:px-6 py-3 ${isSection ? 'font-bold text-violet-400' : 'text-[#a1a1aa]'}`}>
                              {p.lp}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-[#a1a1aa] font-mono text-xs">
                              {p.podstawa}
                            </td>
                            <td className={`px-4 sm:px-6 py-3 ${isSection ? 'font-bold text-violet-300 uppercase text-xs tracking-wide' : 'text-[#d4d4d8]'}`}>
                              {p.opis}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-[#a1a1aa] text-center">
                              {p.jednostka}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-right font-mono font-semibold text-white">
                              {p.ilosc}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-[#71717a] text-xs">
                              {p.uwagi}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {pozycje.length === 0 && (
                  <div className="px-6 py-16 text-center text-[#71717a]">
                    <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
                    <p>AI nie znalazł pozycji przedmiarowych w tym dokumencie.</p>
                    <p className="text-xs mt-1">Upewnij się, że plik zawiera tabele z pozycjami kosztorysowymi.</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
// cache bust 1770386098
// 1770387363
