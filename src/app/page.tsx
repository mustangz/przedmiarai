'use client';

import { useState, useEffect } from 'react';

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

// Room display phases: hidden → detected (show dims) → measured (show area)
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

  // Start animation
  useEffect(() => {
    const t = setTimeout(() => setPhase('scanning'), 1200);
    return () => clearTimeout(t);
  }, []);

  // Scanning phase: scan line + detect rooms (show dims)
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

    // Detect rooms at scan thresholds — show dimensions
    const thresholds = [18, 38, 58, 78];
    const timers = thresholds.map((th, i) =>
      setTimeout(() => setRoomPhase(i, 'detected'), (th / 1.0) * 30)
    );

    return () => {
      clearInterval(scanInterval);
      timers.forEach(clearTimeout);
    };
  }, [phase]);

  // Measuring phase: convert dims → area one by one
  useEffect(() => {
    if (phase !== 'measuring') return;

    const timers = rooms.map((_, i) =>
      setTimeout(() => {
        setRoomPhase(i, 'measured');
        if (i === rooms.length - 1) {
          setTimeout(() => setPhase('done'), 600);
        }
      }, 400 + i * 500)
    );

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Loop
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
          <div className="mockup-dot" />
          <div className="mockup-dot" />
          <div className="mockup-dot" />
          <div className="mockup-header-status">
            {phase === 'scanning' && (
              <span className="mockup-status scanning">
                <span className="mockup-status-dot" />
                Skanowanie rysunku...
              </span>
            )}
            {phase === 'measuring' && (
              <span className="mockup-status scanning">
                <span className="mockup-status-dot" />
                Obliczanie powierzchni...
              </span>
            )}
            {phase === 'done' && (
              <span className="mockup-status done">
                <Icons.Check />
                Gotowe — 4 pomieszczenia, 63.6 m²
              </span>
            )}
          </div>
        </div>
        <div className="mockup-body">
          <div className="mockup-canvas">
            <div className="mockup-floorplan">
              {/* Scan line */}
              {phase === 'scanning' && (
                <div className="scan-line" style={{ top: `${scanProgress}%` }} />
              )}

              {/* Static wall lines */}
              <div className="floorplan-lines">
                <div className="fp-line fp-h" style={{ top: '50%' }} />
                <div className="fp-line fp-v" style={{ left: '48%' }} />
                <div className="fp-line fp-v" style={{ left: '60%', top: '50%', height: '50%' }} />
              </div>

              {/* Rooms */}
              {rooms.map((room, i) => (
                <div
                  key={room.name}
                  className={`mockup-room ${room.cls} ${isVisible(i) ? 'visible' : ''} ${isMeasured(i) ? 'measured' : ''} ${hoveredRoom === i ? 'hovered' : ''}`}
                  onMouseEnter={() => isMeasured(i) && setHoveredRoom(i)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  {isVisible(i) && (
                    <>
                      <div className="room-label">
                        <span className="room-dims">{isMeasured(i) ? room.area : room.dims}</span>
                        {isMeasured(i) && <span className="room-name">{room.name}</span>}
                      </div>
                      {/* Wall dimensions on hover */}
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
              <div
                key={room.name}
                className={`mockup-measurement ${isVisible(i) ? 'visible' : ''} ${isMeasured(i) ? 'measured' : ''} ${hoveredRoom === i ? 'highlighted' : ''}`}
                onMouseEnter={() => isMeasured(i) && setHoveredRoom(i)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                <div className="mockup-measurement-name">{room.name}</div>
                {!isMeasured(i) ? (
                  <div className="mockup-measurement-dims">{room.dims}</div>
                ) : (
                  <>
                    <div className="mockup-measurement-result">
                      <span className="mockup-measurement-area">{room.area}</span>
                      <span className="mockup-measurement-perim">obw. {room.perimeter}</span>
                    </div>
                    {hoveredRoom === i && (
                      <div className="mockup-measurement-walls">
                        {room.w} &times; {room.h}
                      </div>
                    )}
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

/* ─── Presale link ─── */
const PRESALE_URL = 'https://secure.tpay.com/?h=5ebabdbbba03abb3496e58f9845d9d515a39ec13';

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
            <a href="/app/projekt/1" className="nav-cta" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fafafa' }}>
              Panel — Skaner
            </a>
            <a href={PRESALE_URL} className="nav-cta">Kup presale — 299 PLN/mies</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          <Icons.Sparkles />
          <span>Presale — tylko 10 miejsc</span>
        </div>

        <h1 className="hero-title">
          Wgraj PDF lub DWG, odbierz <span className="gradient-text">gotowy przedmiar</span>
        </h1>

        <p className="hero-subtitle">
          Sztuczna inteligencja rozpoznaje pomieszczenia z rysunków PDF i DWG,
          automatycznie oblicza powierzchnie. Bez ręcznego mierzenia.
        </p>

        <div className="hero-card">
          <div className="presale-pricing">
            <span className="price-old">499 PLN/mies</span>
            <span className="price-new">299 PLN/mies</span>
          </div>
          <p className="hero-card-label">Tylko 10 miejsc w cenie presale. Później 499 PLN/mies.</p>
          <a href={PRESALE_URL} className="hero-submit presale-cta">
            Kup presale — 299 PLN/mies
            <Icons.ArrowRight />
          </a>
          <ul className="presale-benefits">
            <li><Icons.Check /><span>Cena zamrożona na zawsze</span></li>
            <li><Icons.Check /><span>Pierwszy dostęp do nowych funkcji</span></li>
          </ul>
        </div>

        <ProductMockup />
      </section>

      {/* METRICS */}
      <section className="metrics">
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-value"><span className="gradient-text">10x</span></div>
            <div className="metric-label">szybciej niż ręcznie</div>
          </div>
          <div className="metric">
            <div className="metric-value"><span className="gradient-text">PDF/DWG</span></div>
            <div className="metric-label">wgraj i gotowe</div>
          </div>
          <div className="metric">
            <div className="metric-value"><span className="gradient-text">m²</span></div>
            <div className="metric-label">automatyczne obliczenia</div>
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
                <li>
                  <Icons.X />
                  <span>Godziny z linijką na ekranie, piksel po pikselu</span>
                </li>
                <li>
                  <Icons.X />
                  <span>Ręczne przepisywanie wymiarów do Excela</span>
                </li>
                <li>
                  <Icons.X />
                  <span>Błędy w obliczeniach = kosztowne poprawki</span>
                </li>
                <li>
                  <Icons.X />
                  <span>Każda zmiana w projekcie = pomiary od nowa</span>
                </li>
              </ul>
            </div>

            <div className="compare-card after">
              <div className="compare-label">Z PrzedmiarAI</div>
              <ul className="compare-list">
                <li>
                  <Icons.Check />
                  <span>AI rozpoznaje pomieszczenia w sekundy</span>
                </li>
                <li>
                  <Icons.Check />
                  <span>Automatyczny eksport do Excel / PDF</span>
                </li>
                <li>
                  <Icons.Check />
                  <span>Precyzyjne obliczenia m² i obwodów</span>
                </li>
                <li>
                  <Icons.Check />
                  <span>Nowy rysunek? Nowy przedmiar w minutę</span>
                </li>
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
              Od rysunku PDF lub DWG do gotowego zestawienia w mniej niż minutę.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <span style={{ color: '#a78bfa' }}><Icons.Upload /></span>
              </div>
              <h3 className="step-title">Wgraj rysunek PDF lub DWG</h3>
              <p className="step-desc">
                Przeciągnij plik na ekran. Obsługujemy PDF, DWG, rzuty, przekroje i plany pięter.
              </p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <span style={{ color: '#60a5fa' }}><Icons.Pointer /></span>
              </div>
              <h3 className="step-title">AI rozpoznaje pomieszczenia</h3>
              <p className="step-desc">
                Sztuczna inteligencja automatycznie wykrywa pomieszczenia i oblicza m² oraz obwód.
              </p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                <span style={{ color: '#22d3ee' }}><Icons.FileSpreadsheet /></span>
              </div>
              <h3 className="step-title">Eksportuj przedmiar</h3>
              <p className="step-desc">
                Pobierz gotowe zestawienie jako Excel lub PDF. Gotowe do wyceny.
              </p>
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
            <p className="section-desc">
              Narzędzie zaprojektowane dla kosztorysantów i inżynierów.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon"><Icons.Zap /></div>
              <div className="feature-content">
                <div className="feature-title">Rozpoznawanie AI</div>
                <div className="feature-desc">Automatyczna detekcja pomieszczeń z PDF i DWG</div>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon"><Icons.BarChart /></div>
              <div className="feature-content">
                <div className="feature-title">Obliczenia m² i obwodów</div>
                <div className="feature-desc">Precyzyjne pomiary powierzchni i obwodów</div>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon"><Icons.Download /></div>
              <div className="feature-content">
                <div className="feature-title">Eksport Excel / PDF</div>
                <div className="feature-desc">Gotowe zestawienie do pobrania jednym klikiem</div>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon"><Icons.Layers /></div>
              <div className="feature-content">
                <div className="feature-title">Kalibracja skali</div>
                <div className="feature-desc">Ustaw skalę rysunku dla dokładnych pomiarów</div>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon"><Icons.Clock /></div>
              <div className="feature-content">
                <div className="feature-title">Historia projektów</div>
                <div className="feature-desc">Wszystkie projekty zapisane i dostępne w jednym miejscu</div>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon"><Icons.Shield /></div>
              <div className="feature-content">
                <div className="feature-title">Bezpieczeństwo danych</div>
                <div className="feature-desc">Twoje rysunki są szyfrowane i bezpieczne</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="cta" className="cta-section">
        <div className="cta-box">
          <h2 className="cta-title">Zacznij oszczędzać czas</h2>
          <p className="cta-desc">
            Zostało tylko 10 miejsc w cenie presale.
            Później cena wzrośnie do 499 PLN/mies.
          </p>

          <div className="cta-presale-pricing">
            <span className="price-old">499 PLN/mies</span>
            <span className="price-new">299 PLN/mies</span>
          </div>

          <a href={PRESALE_URL} className="cta-submit presale-cta">
            Kup presale — 299 PLN/mies
            <Icons.ArrowRight />
          </a>

          <ul className="presale-benefits cta-benefits">
            <li><Icons.Check /><span>Cena zamrożona na zawsze</span></li>
            <li><Icons.Check /><span>Pierwszy dostęp do nowych funkcji</span></li>
          </ul>
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
