'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Inline SVG icons (same pattern as landing page) ─────────
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
  Sparkles: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
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
  FileText: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="panel-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Table: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" /><path d="M3 15h18" />
    </svg>
  ),
};

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

// ─── Auth Gate Component ─────────────────────────────────────
function AuthGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirect: '/panel' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Błąd');
      }

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd serwera');
    } finally {
      setLoading(false);
    }
  };

  // Check if token appeared (e.g. from another tab)
  useEffect(() => {
    const check = () => {
      if (localStorage.getItem('token')) onAuthenticated();
    };
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, [onAuthenticated]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <a href="/" className="auth-logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon-sm" />
          <span className="auth-logo-text">PrzedmiarAI</span>
        </a>

        {!sent ? (
          <>
            <div style={{ margin: '20px 0 8px', padding: '12px 16px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 10 }}>
              <p style={{ fontSize: 14, color: '#c4b5fd', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: '#e9d5ff' }}>Beta — co testujemy:</strong><br />
                Wgraj rzut PDF → AI zmierzy powierzchnie podłóg, ścian, obwody pomieszczeń → eksport do Excela
              </p>
            </div>

            <h1 className="auth-title" style={{ marginTop: 20 }}>Przetestuj za darmo</h1>
            <p className="auth-desc">
              Podaj email, żebyśmy mogli wysłać Ci link do panelu.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="email"
                placeholder="jan@firma.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
                autoFocus
              />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Wysyłanie...' : 'Wyślij link'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-sent">
            <div className="auth-sent-icon">✉️</div>
            <h1 className="auth-title">Sprawdź skrzynkę</h1>
            <p className="auth-desc">
              Wysłaliśmy link do logowania na <strong>{email}</strong>.
              <br />
              Link wygasa za 15 minut.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function PanelPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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

  // Check auth on mount
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  // Show nothing during SSR/hydration
  if (isAuthenticated === null) return null;

  // Show auth gate if not authenticated
  if (!isAuthenticated) {
    return <AuthGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

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
    <>
      {/* Navbar — identical to LP */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <div className="logo-icon"><Icons.Calculator /></div>
            <span className="logo-text">PrzedmiarAI</span>
          </a>
          {state === 'results' && (
            <button type="button" onClick={handleExport} className="nav-cta panel-nav-btn">
              <Icons.Download />
              Eksport Excel
            </button>
          )}
        </div>
      </nav>

      {/* ═══ UPLOAD STATE ═══ */}
      {state === 'upload' && (
        <section className="hero">
          <div className="hero-badge">
            <Icons.Sparkles />
            <span>AI Analiza</span>
          </div>

          <h1 className="hero-title">
            Wgraj przedmiar <span className="gradient-text">PDF</span>
          </h1>

          <p className="hero-subtitle">
            AI wyciągnie wszystkie pozycje, ilości i jednostki.
            Wyeksportujesz do Excela jednym klikiem.
          </p>

          {/* Drop zone — hero-card style */}
          <div
            className={`panel-dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="panel-hidden"
            />

            <div className="panel-dropzone-icon">
              <Icons.Upload />
            </div>

            <p className="panel-dropzone-title">
              {dragActive ? 'Upuść plik tutaj' : 'Przeciągnij PDF lub kliknij'}
            </p>
            <p className="panel-dropzone-hint">
              Przedmiar budowlany w formacie PDF, do 50 MB
            </p>

            <button type="button" className="presale-cta panel-upload-btn">
              <Icons.Upload />
              Wybierz plik PDF
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="panel-error">
              <Icons.AlertCircle />
              {error}
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="panel-progress">
              <Icons.Loader />
              {progress}
            </div>
          )}
        </section>
      )}

      {/* ═══ PREVIEW STATE ═══ */}
      {state === 'preview' && (
        <section className="panel-preview">
          <div className="container">
            <div className="panel-preview-layout">
              {/* PDF Viewer */}
              <div className="panel-viewer">
                <div className="panel-viewer-card">
                  {pageImages.length > 1 && (
                    <div className="panel-viewer-nav">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="panel-viewer-nav-btn"
                      >
                        <Icons.ChevronLeft />
                      </button>
                      <span className="panel-viewer-page">
                        {currentPage + 1} / {pageImages.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1))}
                        disabled={currentPage === pageImages.length - 1}
                        className="panel-viewer-nav-btn"
                      >
                        <Icons.ChevronRight />
                      </button>
                    </div>
                  )}
                  <div className="panel-viewer-body">
                    {pageImages[currentPage] ? (
                      <img
                        src={pageImages[currentPage]}
                        alt={`Strona ${currentPage + 1}`}
                        className="panel-viewer-img"
                      />
                    ) : (
                      <div className="panel-viewer-loading">
                        <Icons.Loader />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar — desktop */}
              <div className="panel-sidebar">
                {/* File info card */}
                <div className="panel-sidebar-card">
                  <div className="panel-file-info">
                    <div className="panel-file-icon">
                      <Icons.FileText />
                    </div>
                    <div className="panel-file-meta">
                      <p className="panel-file-name">{file?.name}</p>
                      <p className="panel-file-size">
                        {pageImages.length} {pageImages.length === 1 ? 'strona' : 'stron'} · {file ? (file.size / 1024 / 1024).toFixed(1) : 0} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={analyze}
                    disabled={isProcessingPdf}
                    className={`panel-analyze-btn ${isProcessingPdf ? 'disabled' : ''}`}
                  >
                    <span className="panel-analyze-btn-glow" />
                    <span className="panel-analyze-btn-inner">
                      {isProcessingPdf ? <Icons.Loader /> : <Icons.Sparkles />}
                      {isProcessingPdf ? 'Ładowanie...' : 'Analizuj AI'}
                    </span>
                  </button>

                  <button type="button" onClick={reset} className="panel-delete-btn">
                    <Icons.Trash />
                    Usuń plik
                  </button>
                </div>

                {/* Tips card */}
                <div className="panel-sidebar-card">
                  <p className="panel-tips-title">Jak to działa</p>
                  <div className="panel-tips-list">
                    <div className="panel-tip"><span className="panel-tip-num">1.</span><span>AI czyta każdą stronę</span></div>
                    <div className="panel-tip"><span className="panel-tip-num">2.</span><span>Wyciąga pozycje i ilości</span></div>
                    <div className="panel-tip"><span className="panel-tip-num">3.</span><span>Eksportujesz do Excela</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="panel-mobile-bar">
              <button type="button" onClick={reset} className="panel-mobile-trash">
                <Icons.Trash />
              </button>
              <button
                type="button"
                onClick={analyze}
                disabled={isProcessingPdf}
                className={`panel-mobile-analyze ${isProcessingPdf ? 'disabled' : ''}`}
              >
                {isProcessingPdf ? <Icons.Loader /> : <Icons.Sparkles />}
                {isProcessingPdf ? 'Ładowanie...' : 'Analizuj AI'}
              </button>
            </div>

            {error && (
              <div className="panel-error" style={{ marginTop: 16 }}>
                <Icons.AlertCircle />
                {error}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ ANALYZING STATE ═══ */}
      {state === 'analyzing' && (
        <section className="hero">
          <div className="panel-analyzing">
            {/* Progress ring */}
            <div className="panel-ring">
              <svg className="panel-ring-svg" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="url(#panelGrad)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${analyzeProgress * 3.52} 352`}
                  style={{ transition: 'stroke-dasharray 0.5s' }}
                />
                <defs>
                  <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="panel-ring-value">{analyzeProgress}%</div>
            </div>

            <h2 className="panel-analyzing-title">Analizuję przedmiar</h2>
            <p className="panel-analyzing-desc">
              AI czyta {pageImages.length} {pageImages.length === 1 ? 'stronę' : 'stron'} i wyciąga pozycje
            </p>

            {progress && (
              <div className="panel-analyzing-badge">
                <Icons.Loader />
                {progress}
              </div>
            )}

            {/* Page thumbnails */}
            <div className="panel-thumbnails">
              {pageImages.slice(0, 10).map((img, i) => (
                <div
                  key={i}
                  className={`panel-thumb ${i < Math.ceil((analyzeProgress / 100) * pageImages.length) ? 'done' : ''}`}
                >
                  <img src={img} alt="" />
                </div>
              ))}
              {pageImages.length > 10 && (
                <div className="panel-thumb panel-thumb-more">
                  +{pageImages.length - 10}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══ RESULTS STATE ═══ */}
      {state === 'results' && (
        <section className="panel-results">
          <div className="container">
            {/* Stats bar */}
            <div className="panel-stats-bar">
              <div className="panel-stats-left">
                <span className="panel-stats-check"><Icons.Check /></span>
                <span className="panel-stats-label">Analiza zakończona</span>
                <span className="panel-stats-meta">
                  {dataRows.length} pozycji · {pageImages.length} stron
                  {usage && <> · {((usage.input_tokens + usage.output_tokens) * 0.000003 * 4.2).toFixed(2)} PLN</>}
                </span>
              </div>
              <div className="panel-stats-actions">
                <button type="button" onClick={() => setState('preview')} className="panel-action-btn">
                  <Icons.Eye /> PDF
                </button>
                <button type="button" onClick={reset} className="panel-action-btn">
                  <Icons.Upload /> Nowy
                </button>
                <button type="button" onClick={handleExport} className="panel-action-btn primary">
                  <Icons.Download /> Excel
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="panel-table-wrap">
              <div className="panel-table-header">
                <Icons.Table />
                <span>Pozycje przedmiaru</span>
              </div>
              <div className="panel-table-scroll">
                <table className="panel-table">
                  <thead>
                    <tr>
                      <th className="panel-th" style={{ width: 60 }}>L.p.</th>
                      <th className="panel-th" style={{ width: 140 }}>Podstawa</th>
                      <th className="panel-th" style={{ minWidth: 280 }}>Opis robót</th>
                      <th className="panel-th" style={{ width: 70 }}>Jedn.</th>
                      <th className="panel-th panel-th-right" style={{ width: 90 }}>Ilość</th>
                      <th className="panel-th" style={{ minWidth: 140 }}>Uwagi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pozycje.map((p, i) => {
                      const isSection = !p.jednostka && !p.ilosc && p.opis;
                      return (
                        <tr key={i} className={`panel-tr ${isSection ? 'section' : ''}`}>
                          <td className={`panel-td ${isSection ? 'panel-td-section-lp' : 'panel-td-lp'}`}>{p.lp}</td>
                          <td className="panel-td panel-td-podstawa">{p.podstawa}</td>
                          <td className={`panel-td ${isSection ? 'panel-td-section-opis' : 'panel-td-opis'}`}>{p.opis}</td>
                          <td className="panel-td panel-td-jedn">{p.jednostka}</td>
                          <td className="panel-td panel-td-ilosc">{p.ilosc}</td>
                          <td className="panel-td panel-td-uwagi">{p.uwagi}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pozycje.length === 0 && (
                <div className="panel-table-empty">
                  <Icons.AlertCircle />
                  <p>AI nie znalazł pozycji przedmiarowych</p>
                </div>
              )}
            </div>

            {error && (
              <div className="panel-error" style={{ marginTop: 16 }}>
                <Icons.AlertCircle />
                {error}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
