'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ─── Inline SVG icons ─── */
const Icons = {
  Sun: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
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
  Scan: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" x2="17" y1="12" y2="12" />
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
  Ruler: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
    </svg>
  ),
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
};

/* ─── Animated Product Mockup ─── */
const rooms = [
  { name: 'Salon',     dims: '5.2 × 4.6 m', w: '5.2 m', h: '4.6 m', area: '23.92 m²', perimeter: '19.6 m', cls: 'v2-mockup-room-1' },
  { name: 'Sypialnia', dims: '4.3 × 4.4 m', w: '4.3 m', h: '4.4 m', area: '18.92 m²', perimeter: '17.4 m', cls: 'v2-mockup-room-2' },
  { name: 'Kuchnia',   dims: '4.1 × 3.0 m', w: '4.1 m', h: '3.0 m', area: '12.30 m²', perimeter: '14.2 m', cls: 'v2-mockup-room-3' },
  { name: 'Łazienka',  dims: '3.2 × 2.7 m', w: '3.2 m', h: '2.7 m', area: '8.64 m²',  perimeter: '11.8 m', cls: 'v2-mockup-room-4' },
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
    <div className="v2-mockup-wrap">
      <div className="v2-mockup">
        <div className="v2-mockup-header">
          <div className="v2-mockup-dots">
            <span /><span /><span />
          </div>
          <div className="v2-mockup-status">
            {phase === 'idle' && <span>Oczekiwanie na rysunek...</span>}
            {phase === 'scanning' && <span className="v2-status-active"><span className="v2-pulse" />Wykrywanie pomieszczeń i ścian...</span>}
            {phase === 'measuring' && <span className="v2-status-active"><span className="v2-pulse" />Obliczanie obmiarów...</span>}
            {phase === 'done' && <span className="v2-status-done"><Icons.Check /> 4 pomieszczenia — 63.78 m² — 12 pozycji przedmiaru</span>}
          </div>
        </div>
        <div className="v2-mockup-body">
          <div className="v2-mockup-canvas">
            <div className="v2-floorplan">
              {phase === 'scanning' && <div className="v2-scanline" style={{ top: `${scanProgress}%` }} />}
              <div className="v2-fp-lines">
                <div className="v2-fp-line v2-fp-h" style={{ top: '50%' }} />
                <div className="v2-fp-line v2-fp-v" style={{ left: '48%' }} />
                <div className="v2-fp-line v2-fp-v" style={{ left: '60%', top: '50%', height: '50%' }} />
              </div>
              {rooms.map((room, i) => (
                <div key={room.name}
                  className={`v2-room ${room.cls} ${isVisible(i) ? 'visible' : ''} ${isMeasured(i) ? 'measured' : ''} ${hoveredRoom === i ? 'hovered' : ''}`}
                  onMouseEnter={() => isMeasured(i) && setHoveredRoom(i)}
                  onMouseLeave={() => setHoveredRoom(null)}>
                  {isVisible(i) && (
                    <>
                      <div className="v2-room-label">
                        <span className="v2-room-dims">{isMeasured(i) ? room.area : room.dims}</span>
                        {isMeasured(i) && <span className="v2-room-name">{room.name}</span>}
                      </div>
                      {hoveredRoom === i && isMeasured(i) && (
                        <>
                          <span className="v2-wall-dim v2-wall-top">{room.w}</span>
                          <span className="v2-wall-dim v2-wall-left">{room.h}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="v2-mockup-sidebar">
            <div className="v2-sidebar-title">Wykryte elementy</div>
            {rooms.map((room, i) => (
              <div key={room.name}
                className={`v2-measurement ${isVisible(i) ? 'visible' : ''} ${isMeasured(i) ? 'measured' : ''} ${hoveredRoom === i ? 'highlighted' : ''}`}
                onMouseEnter={() => isMeasured(i) && setHoveredRoom(i)}
                onMouseLeave={() => setHoveredRoom(null)}>
                <div className="v2-measurement-name">{room.name}</div>
                {!isMeasured(i) ? (
                  <div className="v2-measurement-dims">{room.dims}</div>
                ) : (
                  <div className="v2-measurement-result">
                    <span className="v2-measurement-area">{room.area}</span>
                    <span className="v2-measurement-perim">obw. {room.perimeter}</span>
                  </div>
                )}
              </div>
            ))}
            {phase === 'done' && (
              <div className="v2-sidebar-output">
                <div className="v2-sidebar-title" style={{ marginTop: 12 }}>Przedmiar</div>
                <div className="v2-output-row">Posadzki — 63.78 m²</div>
                <div className="v2-output-row">Tynki ścian — 187.4 m²</div>
                <div className="v2-output-row">Malowanie — 251.0 m²</div>
                <div className="v2-output-row v2-output-more">+ 9 pozycji...</div>
              </div>
            )}
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
    features: ['3 analizy rysunków', 'Do 5 stron / analiza', 'Eksport Excel', 'Czas realizacji: do 24h'],
    cta: 'Wypróbuj za darmo',
    popular: false,
  },
  {
    name: 'Pakiet 5',
    price: 399,
    desc: '79,80 PLN za projekt',
    features: ['5 projektów', 'Do 20 stron / projekt', 'Eksport Excel', 'Weryfikacja eksperta', 'Czas realizacji: do 12h'],
    cta: 'Kup Pakiet 5',
    popular: true,
  },
  {
    name: 'Pakiet 15',
    price: 899,
    desc: '59,90 PLN za projekt',
    features: ['15 projektów', 'Do 50 stron / projekt', 'Eksport Excel + ATH', 'Weryfikacja eksperta', 'Priorytetowe wsparcie'],
    cta: 'Kup Pakiet 15',
    popular: false,
  },
];

/* ─── Main Content ─── */
export default function Home() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className={`v2 ${dark ? 'v2-dark' : ''}`}>
      {/* NAV */}
      <nav className="v2-nav">
        <div className="v2-nav-inner">
          <a href="#" className="v2-logo">
            <div className="v2-logo-icon"><Icons.Calculator /></div>
            <span className="v2-logo-text">PrzedmiarAI</span>
          </a>
          <div className="v2-nav-links">
            <a href="#jak-dziala">Jak to działa</a>
            <a href="#cennik">Cennik</a>
            <button
              onClick={() => setDark(!dark)}
              className="v2-theme-toggle"
              title={dark ? 'Jasny motyw' : 'Ciemny motyw'}
            >
              {dark ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <Link href="/login" className="v2-nav-cta">Zaloguj się</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="v2-hero">
        <div className="v2-hero-content">
          <div className="v2-hero-text">
            <div className="v2-badge">
              <Icons.Sparkles />
              <span>Pierwsze takie narzędzie w Polsce</span>
            </div>

            <h1 className="v2-hero-title">
              Wgraj <span className="v2-gradient">rysunek techniczny</span>,{' '}
              odbierz gotowy przedmiar
            </h1>

            <p className="v2-hero-subtitle">
              AI wykrywa pomieszczenia, ściany, drzwi i okna z Twojego rzutu.
              Automatycznie oblicza powierzchnie, obwody i obmiary.
              Ekspert weryfikuje wynik — dostajesz przedmiar w Excelu.
            </p>

            <div className="v2-hero-buttons">
              <Link href="/login" className="v2-btn-primary">
                Wypróbuj za darmo
                <Icons.ArrowRight />
              </Link>
              <a href="#jak-dziala" className="v2-btn-secondary">
                Zobacz jak to działa
              </a>
            </div>

            <div className="v2-hero-trust">
              <Icons.Shield />
              <span>Każdy wynik weryfikowany przez eksperta kosztorysanta</span>
            </div>
          </div>

          <div className="v2-hero-visual">
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="v2-metrics">
        <div className="v2-container">
          <div className="v2-metrics-grid">
            <div className="v2-metric">
              <div className="v2-metric-icon"><Icons.Scan /></div>
              <div className="v2-metric-value">AI</div>
              <div className="v2-metric-label">wykrywa elementy z rysunku</div>
            </div>
            <div className="v2-metric">
              <div className="v2-metric-icon"><Icons.Ruler /></div>
              <div className="v2-metric-value">m² mb</div>
              <div className="v2-metric-label">automatyczne obmiary</div>
            </div>
            <div className="v2-metric">
              <div className="v2-metric-icon"><Icons.Shield /></div>
              <div className="v2-metric-value">100%</div>
              <div className="v2-metric-label">weryfikacja eksperta</div>
            </div>
            <div className="v2-metric">
              <div className="v2-metric-icon"><Icons.Download /></div>
              <div className="v2-metric-value">Excel</div>
              <div className="v2-metric-label">gotowy przedmiar</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="v2-section">
        <div className="v2-container">
          <div className="v2-section-header">
            <span className="v2-label">Problem</span>
            <h2>Ręczne przedmiarowanie zabiera 70% czasu</h2>
            <p>Kosztorysant siedzi z linijką nad rysunkiem i liczy metry kwadratowe. To przeszłość.</p>
          </div>
          <div className="v2-compare">
            <div className="v2-compare-card v2-before">
              <div className="v2-compare-label">Tradycyjnie</div>
              <ul>
                <li><Icons.X /><span>Godziny z linijką nad rysunkiem</span></li>
                <li><Icons.X /><span>Ręczne liczenie powierzchni i obwodów</span></li>
                <li><Icons.X /><span>Przepisywanie wymiarów do Excela</span></li>
                <li><Icons.X /><span>Zmiana w projekcie = pomiary od nowa</span></li>
              </ul>
            </div>
            <div className="v2-compare-card v2-after">
              <div className="v2-compare-label">Z PrzedmiarAI</div>
              <ul>
                <li><Icons.Check /><span>AI skanuje rysunek i wykrywa elementy</span></li>
                <li><Icons.Check /><span>Automatyczne obliczanie m², mb, szt.</span></li>
                <li><Icons.Check /><span>Gotowy przedmiar w Excelu</span></li>
                <li><Icons.Check /><span>Nowy rysunek = nowy wynik w godziny</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="v2-section v2-section-alt" id="jak-dziala">
        <div className="v2-container">
          <div className="v2-section-header">
            <span className="v2-label">Jak to działa</span>
            <h2>Od rysunku do przedmiaru w 3 krokach</h2>
            <p>Wgrywasz rzut w PDF — AI robi resztę.</p>
          </div>
          <div className="v2-steps">
            <div className="v2-step">
              <div className="v2-step-num">1</div>
              <div className="v2-step-icon"><Icons.Upload /></div>
              <h3>Wgraj rysunek PDF</h3>
              <p>Rzut kondygnacji, przekrój, plan zagospodarowania — dowolny rysunek techniczny w PDF.</p>
            </div>
            <div className="v2-step-arrow">&rarr;</div>
            <div className="v2-step">
              <div className="v2-step-num">2</div>
              <div className="v2-step-icon"><Icons.Scan /></div>
              <h3>AI wykrywa i mierzy</h3>
              <p>Sztuczna inteligencja rozpoznaje pomieszczenia, ściany, drzwi i okna. Oblicza powierzchnie, obwody i długości.</p>
            </div>
            <div className="v2-step-arrow">&rarr;</div>
            <div className="v2-step">
              <div className="v2-step-num">3</div>
              <div className="v2-step-icon"><Icons.FileSpreadsheet /></div>
              <h3>Odbierz przedmiar</h3>
              <p>Ekspert weryfikuje wynik. Dostajesz gotowy przedmiar w Excelu z pozycjami, jednostkami i ilościami.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DETECT */}
      <section className="v2-section">
        <div className="v2-container">
          <div className="v2-section-header">
            <span className="v2-label">Detekcja AI</span>
            <h2>Co wykrywamy z rysunku</h2>
            <p>Jeden rysunek = dziesiątki pozycji przedmiarowych.</p>
          </div>
          <div className="v2-detect-grid">
            <div className="v2-detect-card">
              <div className="v2-detect-icon"><Icons.Home /></div>
              <h3>Pomieszczenia</h3>
              <p>Wykrycie granic, powierzchnia (m²), obwód (mb)</p>
              <div className="v2-detect-output">
                <span>Posadzki</span>
                <span>Sufity</span>
                <span>Tynki</span>
                <span>Malowanie</span>
              </div>
            </div>
            <div className="v2-detect-card">
              <div className="v2-detect-icon"><Icons.Layers /></div>
              <h3>Ściany</h3>
              <p>Nośne, działowe, zewnętrzne — długość, grubość</p>
              <div className="v2-detect-output">
                <span>Murowanie</span>
                <span>Tynki</span>
                <span>Izolacja</span>
                <span>Malowanie</span>
              </div>
            </div>
            <div className="v2-detect-card">
              <div className="v2-detect-icon"><Icons.Scan /></div>
              <h3>Drzwi i okna</h3>
              <p>Ilość, lokalizacja, typ otworu</p>
              <div className="v2-detect-output">
                <span>Montaż</span>
                <span>Ościeżnice</span>
                <span>Obróbka</span>
                <span>Parapety</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="v2-section v2-section-alt">
        <div className="v2-container">
          <div className="v2-section-header">
            <span className="v2-label">Funkcje</span>
            <h2>Narzędzie dla kosztorysantów</h2>
          </div>
          <div className="v2-features-grid">
            <div className="v2-feature">
              <div className="v2-feature-icon"><Icons.Zap /></div>
              <div><strong>Detekcja z rysunków</strong><p>AI rozpoznaje elementy budowlane bezpośrednio z rysunku technicznego</p></div>
            </div>
            <div className="v2-feature">
              <div className="v2-feature-icon"><Icons.Ruler /></div>
              <div><strong>Automatyczne obmiary</strong><p>Powierzchnie, obwody, długości ścian — obliczone z geometrii rysunku</p></div>
            </div>
            <div className="v2-feature">
              <div className="v2-feature-icon"><Icons.Shield /></div>
              <div><strong>Weryfikacja eksperta</strong><p>Każdy wynik sprawdza doświadczony kosztorysant przed wysyłką</p></div>
            </div>
            <div className="v2-feature">
              <div className="v2-feature-icon"><Icons.Download /></div>
              <div><strong>Eksport Excel</strong><p>Gotowy przedmiar z pozycjami, jednostkami i ilościami</p></div>
            </div>
            <div className="v2-feature">
              <div className="v2-feature-icon"><Icons.Clock /></div>
              <div><strong>Szybka realizacja</strong><p>Wynik od 4h do 24h w zależności od pakietu</p></div>
            </div>
            <div className="v2-feature">
              <div className="v2-feature-icon"><Icons.BarChart /></div>
              <div><strong>Rosnąca dokładność</strong><p>AI uczy się z każdą analizą — coraz lepsze wyniki</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="v2-section">
        <div className="v2-container">
          <div className="v2-section-header">
            <span className="v2-label">Roadmap</span>
            <h2>Rozwój pod Twoje potrzeby</h2>
          </div>
          <div className="v2-roadmap">
            <div className="v2-roadmap-card">
              <span className="v2-roadmap-badge">Wkrótce</span>
              <h3>Eksport ATH</h3>
              <p>Bezpośredni import do NormaPRO, Zuzia, Rodos</p>
            </div>
            <div className="v2-roadmap-card">
              <span className="v2-roadmap-badge">Wkrótce</span>
              <h3>Mapowanie KNR / KNNR</h3>
              <p>AI dopasuje pozycje do katalogów norm</p>
            </div>
            <div className="v2-roadmap-card">
              <span className="v2-roadmap-badge v2-badge-planned">W planie</span>
              <h3>Twoje potrzeby</h3>
              <p>Rozwijamy produkt z kosztorysantami</p>
            </div>
          </div>
          <div className="v2-ai-banner">
            <Icons.Sparkles />
            <p>Stale uczymy nasze modele AI — wydajność i dokładność rosną z każdym miesiącem.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="v2-section v2-section-alt" id="cennik">
        <div className="v2-container">
          <div className="v2-section-header">
            <span className="v2-label">Cennik</span>
            <h2>Płacisz za projekt, nie za subskrypcję</h2>
            <p>Bez abonamentu. Kupujesz pakiet — wykorzystujesz kiedy chcesz.</p>
          </div>
          <div className="v2-pricing-grid">
            {packs.map((pack) => (
              <div key={pack.name} className={`v2-pricing-card ${pack.popular ? 'v2-popular' : ''}`}>
                {pack.popular && <div className="v2-popular-badge">Najpopularniejszy</div>}
                <h3>{pack.name}</h3>
                <div className="v2-price">
                  <span className="v2-price-amount">{pack.price === 0 ? '0' : pack.price}</span>
                  <span className="v2-price-currency">PLN</span>
                </div>
                <p className="v2-price-desc">{pack.desc}</p>
                <ul className="v2-pricing-features">
                  {pack.features.map((f) => (
                    <li key={f}><Icons.Check /><span>{f}</span></li>
                  ))}
                </ul>
                <Link
                  href={pack.price === 0 ? '/login' : `/login?pack=${pack.price}`}
                  className={`v2-pricing-cta ${pack.popular ? 'v2-cta-primary' : ''}`}
                >
                  {pack.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="v2-pricing-custom">
            <div>
              <h4>Potrzebujesz więcej?</h4>
              <p>Przygotujemy indywidualną ofertę dla Twojej firmy.</p>
            </div>
            <a href="mailto:kontakt@przedmiar.ai" className="v2-btn-secondary">
              Napisz do nas <Icons.ArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="v2-footer">
        <div className="v2-footer-inner">
          <div className="v2-logo">
            <div className="v2-logo-icon"><Icons.Calculator /></div>
            <span className="v2-logo-text">PrzedmiarAI</span>
          </div>
          <p>&copy; 2026 PrzedmiarAI. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
