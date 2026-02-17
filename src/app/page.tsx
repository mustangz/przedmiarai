'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ─── Inline SVG icons ─── */
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
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  Pointer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" />
    </svg>
  ),
  FileSpreadsheet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2" /><path d="M8 17h2" /><path d="M14 13h2" /><path d="M14 17h2" />
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
  Layers: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  ),
};

/* ─── Animated Product Mockup ─── */
const rooms = [
  { name: 'Salon',     dims: '5.2 × 4.6 m', w: '5.2 m', h: '4.6 m', area: '24.1 m²', perimeter: '19.6 m', cls: 'mockup-room-1' },
  { name: 'Sypialnia', dims: '4.3 × 4.3 m', w: '4.3 m', h: '4.3 m', area: '18.5 m²', perimeter: '17.2 m', cls: 'mockup-room-2' },
  { name: 'Kuchnia',   dims: '4.1 × 3.0 m', w: '4.1 m', h: '3.0 m', area: '12.3 m²', perimeter: '14.2 m', cls: 'mockup-room-3' },
  { name: 'Łazienka',  dims: '3.2 × 2.7 m', w: '3.2 m', h: '2.7 m', area: '8.7 m²',  perimeter: '11.8 m', cls: 'mockup-room-4' },
];

type RoomPhase = 'hidden' | 'detected' | 'measured';

function ProductMockup() {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'measuring' | 'done'>('idle');
  const [roomPhases, setRoomPhases] = useState<RoomPhase[]>(['hidden', 'hidden', 'hidden', 'hidden']);
  const [scanProgress, setScanProgress] = useState(0);
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);

  const setRoomPhase = (index: number, p: RoomPhase) => {
    setRoomPhases((prev) => {
      const next = [...prev];
      next[index] = p;
      return next;
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setPhase('scanning'), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'scanning') return;
    let progress = 0;
    const scanInterval = setInterval(() => {
      progress += 1.0;
      setScanProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(scanInterval);
        setPhase('measuring');
      }
    }, 30);
    const thresholds = [18, 38, 58, 78];
    const timers = thresholds.map((th, i) =>
      setTimeout(() => setRoomPhase(i, 'detected'), (th / 1.0) * 30)
    );
    return () => { clearInterval(scanInterval); timers.forEach(clearTimeout); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'measuring') return;
    const timers = rooms.map((_, i) =>
      setTimeout(() => {
        setRoomPhase(i, 'measured');
        if (i === rooms.length - 1) setTimeout(() => setPhase('done'), 600);
      }, 400 + i * 500)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done') return;
    const t = setTimeout(() => {
      setRoomPhases(['hidden', 'hidden', 'hidden', 'hidden']);
      setScanProgress(0);
      setPhase('idle');
      setTimeout(() => setPhase('scanning'), 800);
    }, 5000);
    return () => clearTimeout(t);
  }, [phase]);

  const isVisible = (i: number) => roomPhases[i] !== 'hidden';
  const isMeasured = (i: number) => roomPhases[i] === 'measured';

  return (
    <div className="hero-visual">
      <div className="hero-mockup">
        <div className="mockup-header">
          <div className="mockup-dot" /><div className="mockup-dot" /><div className="mockup-dot" />
          <div className="mockup-header-status">
            {phase === 'scanning' && <span className="mockup-status scanning"><span className="mockup-status-dot" />Skanowanie rysunku...</span>}
            {phase === 'measuring' && <span className="mockup-status scanning"><span className="mockup-status-dot" />Obliczanie powierzchni...</span>}
            {phase === 'done' && <span className="mockup-status done"><Icons.Check />Gotowe — 4 pomieszczenia, 63.6 m²</span>}
          </div>
        </div>
        <div className="mockup-body">
          <div className="mockup-canvas">
            <div className="mockup-floorplan">
              {phase === 'scanning' && <div className="scan-line" style={{ top: `${scanProgress}%` }} />}
              <div className="floorplan-lines">
                <div className="fp-line fp-h" style={{ top: '50%' }} />
                <div className="fp-line fp-v" style={{ left: '48%' }} />
                <div className="fp-line fp-v" style={{ left: '60%', top: '50%', height: '50%' }} />
              </div>
              {rooms.map((room, i) => (
                <div key={room.name}
                  className={`mockup-room ${room.cls} ${isVisible(i) ? 'visible' : ''} ${isMeasured(i) ? 'measured' : ''} ${hoveredRoom === i ? 'hovered' : ''}`}
                  onMouseEnter={() => isMeasured(i) && setHoveredRoom(i)}
                  onMouseLeave={() => setHoveredRoom(null)}>
                  {isVisible(i) && (
                    <>
                      <div className="room-label">
                        <span className="room-dims">{isMeasured(i) ? room.area : room.dims}</span>
                        {isMeasured(i) && <span className="room-name">{room.name}</span>}
                      </div>
                      {hoveredRoom === i && isMeasured(i) && (
                        <>
                          <span className="wall-dim wall-top">{room.w}</span>
                          <span className="wall-dim wall-bottom">{room.w}</span>
                          <span className="wall-dim wall-left">{room.h}</span>
                          <span className="wall-dim wall-right">{room.h}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mockup-sidebar">
            <div className="mockup-sidebar-title">Pomiary</div>
            {rooms.map((room, i) => (
              <div key={room.name}
                className={`mockup-measurement ${isVisible(i) ? 'visible' : ''} ${isMeasured(i) ? 'measured' : ''} ${hoveredRoom === i ? 'highlighted' : ''}`}
                onMouseEnter={() => isMeasured(i) && setHoveredRoom(i)}
                onMouseLeave={() => setHoveredRoom(null)}>
                <div className="mockup-measurement-name">{room.name}</div>
                {!isMeasured(i) ? (
                  <div className="mockup-measurement-dims">{room.dims}</div>
                ) : (
                  <>
                    <div className="mockup-measurement-result">
                      <span className="mockup-measurement-area">{room.area}</span>
                      <span className="mockup-measurement-perim">obw. {room.perimeter}</span>
                    </div>
                    {hoveredRoom === i && <div className="mockup-measurement-walls">{room.w} &times; {room.h}</div>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pricing packs ─── */
const packs = [
  {
    name: 'Pionier',
    price: 0,
    desc: 'Zostało 5 miejsc',
    features: ['3 analizy przedmiaru', 'Eksport Excel', 'Czas realizacji: do 24h', 'Feedback po analizie'],
    cta: 'Dołącz jako Pionier',
    popular: false,
  },
  {
    name: 'Pakiet 5',
    price: 399,
    desc: '79,80 PLN za analizę',
    features: ['5 analiz przedmiaru', 'Eksport Excel', 'Czas realizacji: do 12h', 'Weryfikacja eksperta'],
    cta: 'Kup Pakiet 5',
    popular: true,
  },
  {
    name: 'Pakiet 15',
    price: 899,
    desc: '59,90 PLN za analizę',
    features: ['15 analiz przedmiaru', 'Eksport Excel', 'Czas realizacji: do 6h', 'Weryfikacja eksperta', 'Priorytetowe wsparcie'],
    cta: 'Kup Pakiet 15',
    popular: false,
  },
];

/* ─── Main Content ─── */
function HomeContent() {

  return (
    <>
      {/* NAV */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#" className="logo">
            <div className="logo-icon"><Icons.Calculator /></div>
            <span className="logo-text">PrzedmiarAI</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/login" className="nav-link-login">Zaloguj</Link>
            <a href="#cennik" className="nav-cta">Cennik</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero hero-full" id="hero">
        {/* Animated background — floor plan */}
        <div className="hero-bg">
          <div className="hero-bg-grid" />
          <div className="hero-bg-scanline" />

          {/* House floor plan */}
          <div className="hero-floorplan">
            {/* Outer walls */}
            <div className="fp-wall fp-outer" />

            {/* Internal walls */}
            <div className="fp-wall fp-h-wall fp-wall-1" /> {/* horizontal divider top */}
            <div className="fp-wall fp-h-wall fp-wall-2" /> {/* horizontal divider bottom */}
            <div className="fp-wall fp-v-wall fp-wall-3" /> {/* vertical left */}
            <div className="fp-wall fp-v-wall fp-wall-4" /> {/* vertical right */}
            <div className="fp-wall fp-v-wall fp-wall-5" /> {/* vertical middle-bottom */}

            {/* Room fills — revealed by scanner */}
            <div className="fp-room fp-room-1">
              <span className="fp-room-label">Salon</span>
              <span className="fp-room-area">24.1 m²</span>
            </div>
            <div className="fp-room fp-room-2">
              <span className="fp-room-label">Kuchnia</span>
              <span className="fp-room-area">12.3 m²</span>
            </div>
            <div className="fp-room fp-room-3">
              <span className="fp-room-label">Sypialnia</span>
              <span className="fp-room-area">18.5 m²</span>
            </div>
            <div className="fp-room fp-room-4">
              <span className="fp-room-label">Łazienka</span>
              <span className="fp-room-area">6.2 m²</span>
            </div>
            <div className="fp-room fp-room-5">
              <span className="fp-room-label">Korytarz</span>
              <span className="fp-room-area">8.7 m²</span>
            </div>
            <div className="fp-room fp-room-6">
              <span className="fp-room-label">Gabinet</span>
              <span className="fp-room-area">10.4 m²</span>
            </div>

            {/* Dimension lines */}
            <div className="fp-dim fp-dim-top"><span>12.8 m</span></div>
            <div className="fp-dim fp-dim-side"><span>9.6 m</span></div>

            {/* Door openings */}
            <div className="fp-door fp-door-1" />
            <div className="fp-door fp-door-2" />
            <div className="fp-door fp-door-3" />
          </div>
        </div>

        <div className="hero-inner">
          <div className="hero-badge">
            <Icons.Sparkles />
            <span>AI, które się uczy z każdą analizą</span>
          </div>

          <h1 className="hero-title">
            Wgraj przedmiar PDF, odbierz <span className="gradient-text">gotowy kosztorys</span>
          </h1>

          <p className="hero-subtitle">
            AI analizuje Twój przedmiar i generuje zestawienie w Excelu.
            Ekspert weryfikuje każdy wynik.
          </p>

          <div className="hero-buttons">
            <Link href="/login" className="hero-btn-primary">
              Wypróbuj za darmo
              <Icons.ArrowRight />
            </Link>
            <a href="#cennik" className="hero-btn-secondary">
              Zobacz cennik
            </a>
          </div>
        </div>

        <a href="#demo" className="hero-scroll-arrow" aria-label="Przewiń w dół">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>
      </section>

      {/* DEMO - Scanner mockup */}
      <section id="demo" className="demo-section">
        <div className="container">
          <ProductMockup />
        </div>
      </section>

      {/* METRICS */}
      <section id="metrics" className="metrics">

        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-value"><span className="gradient-text">10x</span></div>
            <div className="metric-label">szybciej niż ręcznie</div>
          </div>
          <div className="metric">
            <div className="metric-value"><span className="gradient-text">PDF</span></div>
            <div className="metric-label">wgraj i gotowe</div>
          </div>
          <div className="metric">
            <div className="metric-value"><span className="gradient-text">AI</span></div>
            <div className="metric-label">weryfikowane przez eksperta</div>
          </div>
          <div className="metric">
            <div className="metric-value"><span className="gradient-text">Excel</span></div>
            <div className="metric-label">eksport jednym klikiem</div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Problem</p>
            <h2 className="section-title">Koniec z ręcznym przedmiarowaniem</h2>
            <p className="section-desc">
              Zobacz, co się zmienia, gdy AI przejmuje żmudną robotę.
            </p>
          </div>
          <div className="compare-grid">
            <div className="compare-card before">
              <div className="compare-label">Bez PrzedmiarAI</div>
              <ul className="compare-list">
                <li><Icons.X /><span>Godziny z linijką na ekranie, piksel po pikselu</span></li>
                <li><Icons.X /><span>Ręczne przepisywanie wymiarów do Excela</span></li>
                <li><Icons.X /><span>Błędy w obliczeniach = kosztowne poprawki</span></li>
                <li><Icons.X /><span>Każda zmiana w projekcie = pomiary od nowa</span></li>
              </ul>
            </div>
            <div className="compare-card after">
              <div className="compare-label">Z PrzedmiarAI</div>
              <ul className="compare-list">
                <li><Icons.Check /><span>AI analizuje przedmiar w minuty</span></li>
                <li><Icons.Check /><span>Automatyczny eksport do Excel</span></li>
                <li><Icons.Check /><span>Ekspert weryfikuje każdy wynik</span></li>
                <li><Icons.Check /><span>Nowy przedmiar? Wynik w kilka godzin</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Jak to działa</p>
            <h2 className="section-title">Trzy kroki do gotowego przedmiaru</h2>
            <p className="section-desc">
              Od przedmiaru PDF do gotowego zestawienia Excel.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <span style={{ color: '#a78bfa' }}><Icons.Upload /></span>
              </div>
              <h3 className="step-title">Wgraj przedmiar PDF</h3>
              <p className="step-desc">Przeciągnij plik na ekran. Obsługujemy PDF z przedmiarami robót.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <span style={{ color: '#60a5fa' }}><Icons.Pointer /></span>
              </div>
              <h3 className="step-title">AI analizuje + ekspert weryfikuje</h3>
              <p className="step-desc">Sztuczna inteligencja wyciąga dane, a nasz ekspert sprawdza poprawność.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                <span style={{ color: '#22d3ee' }}><Icons.FileSpreadsheet /></span>
              </div>
              <h3 className="step-title">Pobierz Excel</h3>
              <p className="step-desc">Gotowe zestawienie do pobrania. Przygotowane do wyceny.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Funkcje</p>
            <h2 className="section-title">Wszystko, czego potrzebujesz</h2>
            <p className="section-desc">Narzędzie zaprojektowane dla kosztorysantów i inżynierów.</p>
          </div>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon"><Icons.Zap /></div>
              <div className="feature-content">
                <div className="feature-title">Analiza AI</div>
                <div className="feature-desc">Automatyczna ekstrakcja danych z przedmiarów PDF</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><Icons.Shield /></div>
              <div className="feature-content">
                <div className="feature-title">Weryfikacja eksperta</div>
                <div className="feature-desc">Każdy wynik sprawdzany przez doświadczonego kosztorysanta</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><Icons.Download /></div>
              <div className="feature-content">
                <div className="feature-title">Eksport Excel</div>
                <div className="feature-desc">Gotowe zestawienie do pobrania jednym klikiem</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><Icons.Clock /></div>
              <div className="feature-content">
                <div className="feature-title">Szybka realizacja</div>
                <div className="feature-desc">Wynik od 4h do 24h w zależności od pakietu</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><Icons.Layers /></div>
              <div className="feature-content">
                <div className="feature-title">Historia analiz</div>
                <div className="feature-desc">Wszystkie analizy zapisane i dostępne w panelu</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><Icons.BarChart /></div>
              <div className="feature-content">
                <div className="feature-title">Rosnąca dokładność</div>
                <div className="feature-desc">AI uczy się z każdą analizą — coraz lepsze wyniki</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS / ROADMAP */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Integracje</p>
            <h2 className="section-title">Rozwój pod Twoje potrzeby</h2>
            <p className="section-desc">
              Budujemy narzędzie wspólnie z kosztorysantami. Powiedz nam, czego potrzebujesz.
            </p>
          </div>

          <div className="roadmap-grid">
            <div className="roadmap-card roadmap-soon">
              <div className="roadmap-badge">Wkrótce</div>
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3-3 3 3" /></svg>
              </div>
              <h3 className="roadmap-title">Eksport ATH</h3>
              <p className="roadmap-desc">
                Bezpośredni import do NormaPRO, Zuzia, Rodos i innych programów kosztorysowych. Zero przepisywania.
              </p>
            </div>

            <div className="roadmap-card roadmap-soon">
              <div className="roadmap-badge">Wkrótce</div>
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              </div>
              <h3 className="roadmap-title">Mapowanie KNR / KNNR</h3>
              <p className="roadmap-desc">
                AI automatycznie dopasuje pozycje przedmiaru do katalogów norm. Gotowe do wyceny.
              </p>
            </div>

            <div className="roadmap-card roadmap-planned">
              <div className="roadmap-badge planned">W planie</div>
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" /></svg>
              </div>
              <h3 className="roadmap-title">Twoje potrzeby</h3>
              <p className="roadmap-desc">
                Rozwijamy produkt pod realne potrzeby użytkowników. Napisz, czego Ci brakuje — zbudujemy to.
              </p>
            </div>
          </div>

          <div className="ai-learning-banner" style={{ marginTop: '32px' }}>
            <Icons.Sparkles />
            <p>
              Stale uczymy nasze modele AI — wydajność i dokładność rosną z każdym miesiącem.
              Każda analiza pomaga nam dostarczać lepsze wyniki.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="cennik" className="section pricing-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Cennik</p>
            <h2 className="section-title">Płacisz za analizę, nie za subskrypcję</h2>
            <p className="section-desc">Bez abonamentu. Kupujesz pakiet analiz — wykorzystujesz kiedy chcesz.</p>
          </div>

          <div className="pricing-grid">
            {packs.map((pack) => (
              <div key={pack.name} className={`pricing-card ${pack.popular ? 'popular' : ''}`}>
                {pack.popular && <div className="pricing-popular-badge">Najlepszy stosunek ceny</div>}
                <div className="pricing-card-header">
                  <h3 className="pricing-plan-name">{pack.name}</h3>
                  <div className="pricing-price">
                    <span className="pricing-amount">{pack.price === 0 ? '0' : pack.price}</span>
                    <span className="pricing-currency">PLN</span>
                  </div>
                  <p className="pricing-per-unit">{pack.desc}</p>
                </div>
                <ul className="pricing-features">
                  {pack.features.map((f) => (
                    <li key={f}><Icons.Check /><span>{f}</span></li>
                  ))}
                </ul>
                <Link
                  href={pack.price === 0 ? '/login' : `/login?pack=${pack.price}`}
                  className={`pricing-cta ${pack.popular ? 'popular' : ''}`}
                >
                  {pack.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="pricing-custom">
            <div className="pricing-custom-inner">
              <div>
                <h4 className="pricing-custom-title">Potrzebujesz więcej analiz?</h4>
                <p className="pricing-custom-desc">Przygotujemy indywidualną ofertę dopasowaną do Twojej firmy.</p>
              </div>
              <a href="mailto:kontakt@przedmiar.ai" className="pricing-custom-cta">
                Napisz do nas
                <Icons.ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <a href="#" className="logo">
            <div className="logo-icon" style={{ width: 28, height: 28 }}><Icons.Calculator /></div>
            <span className="logo-text" style={{ fontSize: 15 }}>PrzedmiarAI</span>
          </a>
          <p className="footer-text">&copy; 2026 PrzedmiarAI. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
