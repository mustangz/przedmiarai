'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { track } from '@vercel/analytics';

// Simple inline SVG icons
const Icons = {
  Calculator: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" />
      <path d="M12 14h.01" /><path d="M8 14h.01" />
      <path d="M12 18h.01" /><path d="M8 18h.01" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Shuffle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
      <path d="m18 2 4 4-4 4" /><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" /><path d="m18 14 4 4-4 4" />
    </svg>
  ),
  Target: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Repeat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  Pointer: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" />
    </svg>
  ),
  FileSpreadsheet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2" /><path d="M8 17h2" /><path d="M14 13h2" /><path d="M14 17h2" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [variant, setVariant] = useState<'a' | 'b'>('a');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const v = searchParams.get('v');
    if (v === 'b') {
      setVariant('b');
    } else if (v === 'a') {
      setVariant('a');
    } else {
      // Random 50/50 split if no param
      setVariant(Math.random() > 0.5 ? 'b' : 'a');
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    track('signup_submit', { variant: 'a' });
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, variant: 'a' }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail('');
        track('signup_success', { variant: 'a' });
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleBuyClick = () => {
    track('checkout_click', { variant: 'b', price: 199 });
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    track('checkout_email_submit', { variant: 'b' });
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, variant: 'b', intent: 'purchase' }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail('');
        track('checkout_email_success', { variant: 'b' });
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <>
      {/* NAVIGATION */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#" className="logo">
            <div className="logo-icon"><Icons.Calculator /></div>
            <span className="logo-text">PrzedmiarAI</span>
          </a>
          {variant === 'a' ? (
            <a href="#cta" className="nav-cta">Dołącz za darmo</a>
          ) : (
            <a href="#cta" className="nav-cta" style={{ background: '#22c55e' }}>Kup teraz — 199 PLN</a>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          <Icons.Sparkles />
          <span>AI dla kosztorysantów</span>
        </div>
        
        <h1 className="hero-title">
          Przedmiar w <span className="gradient-text">minutę</span>,<br />nie godzinę
        </h1>
        
        <p className="hero-subtitle">
          Wgraj rysunek PDF — sztuczna inteligencja automatycznie zmierzy wszystkie pomieszczenia. 
          Zero ręcznego klikania.
        </p>
        
        {variant === 'a' ? (
          <a href="#cta" className="hero-cta">
            Wypróbuj za darmo <Icons.ArrowRight />
          </a>
        ) : (
          <a href="#cta" className="hero-cta" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            Kup dostęp — 199 PLN/mies <Icons.ArrowRight />
          </a>
        )}
        
        <p className="hero-note">
          {variant === 'a' 
            ? <>Dołącz do <strong>500+</strong> kosztorysantów na liście oczekujących</>
            : <>🔥 <strong>Promocja</strong>: -50% przez pierwsze 3 miesiące</>
          }
        </p>
      </section>

      {/* PROBLEM */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Problem</p>
            <h2 className="section-title">Brzmi znajomo?</h2>
            <p className="section-desc">Każdy kosztorysant traci godziny na zadania, które AI robi w sekundy.</p>
          </div>
          
          <div className="card-grid card-grid-4">
            <div className="card">
              <div className="card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <span style={{ color: '#ef4444' }}><Icons.Clock /></span>
              </div>
              <h3 className="card-title">Ręczne mierzenie</h3>
              <p className="card-desc">Godziny z linijką na ekranie zamiast produktywnej pracy</p>
            </div>
            <div className="card">
              <div className="card-icon" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
                <span style={{ color: '#f97316' }}><Icons.Shuffle /></span>
              </div>
              <h3 className="card-title">Przeklikiwanie</h3>
              <p className="card-desc">CAD → PDF → Excel → CAD. Ciągle w kółko</p>
            </div>
            <div className="card">
              <div className="card-icon" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                <span style={{ color: '#eab308' }}><Icons.Target /></span>
              </div>
              <h3 className="card-title">Kosztowne błędy</h3>
              <p className="card-desc">Każda pomyłka = tysiące złotych straty</p>
            </div>
            <div className="card">
              <div className="card-icon" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                <span style={{ color: '#ec4899' }}><Icons.Repeat /></span>
              </div>
              <h3 className="card-title">Powtarzanie</h3>
              <p className="card-desc">Te same pomiary od nowa przy każdej zmianie</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Rozwiązanie</p>
            <h2 className="section-title">Trzy proste kroki</h2>
            <p className="section-desc">Od rysunku do gotowego przedmiaru w mniej niż minutę.</p>
          </div>
          
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">01</div>
              <div className="card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', margin: '0 auto 16px' }}>
                <span style={{ color: '#8b5cf6' }}><Icons.Upload /></span>
              </div>
              <h3 className="step-title">Wgraj PDF</h3>
              <p className="step-desc">Przeciągnij rysunek — AI rozpozna pomieszczenia</p>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', margin: '0 auto 16px' }}>
                <span style={{ color: '#3b82f6' }}><Icons.Pointer /></span>
              </div>
              <h3 className="step-title">Kliknij i mierz</h3>
              <p className="step-desc">Zaznacz obszar — system obliczy m² i obwód</p>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="card-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', margin: '0 auto 16px' }}>
                <span style={{ color: '#06b6d4' }}><Icons.FileSpreadsheet /></span>
              </div>
              <h3 className="step-title">Eksportuj</h3>
              <p className="step-desc">Pobierz przedmiar jako Excel lub PDF</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-label">Cennik</p>
            <h2 className="section-title">Prosty cennik</h2>
            <p className="section-desc">Bez ukrytych opłat. Zacznij za darmo.</p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="pricing-name">Starter</h3>
              <p className="pricing-desc">Dla freelancerów</p>
              <div className="pricing-price">199 <span>PLN/mies</span></div>
              <ul className="pricing-features">
                <li><Icons.Check /> 10 projektów / miesiąc</li>
                <li><Icons.Check /> Export Excel / PDF</li>
                <li><Icons.Check /> Email support</li>
              </ul>
              <a href="#cta" className="pricing-cta pricing-cta-secondary">Wybierz plan</a>
            </div>
            
            <div className="pricing-card popular">
              <div className="pricing-badge">Najpopularniejszy</div>
              <h3 className="pricing-name">Pro</h3>
              <p className="pricing-desc">Dla profesjonalistów</p>
              <div className="pricing-price">499 <span>PLN/mies</span></div>
              <ul className="pricing-features">
                <li><Icons.Check /> Bez limitu projektów</li>
                <li><Icons.Check /> Priorytetowy support</li>
                <li><Icons.Check /> Dostęp API</li>
                <li><Icons.Check /> Własne szablony</li>
              </ul>
              <a href="#cta" className="pricing-cta pricing-cta-primary">Wybierz plan</a>
            </div>
            
            <div className="pricing-card">
              <h3 className="pricing-name">Enterprise</h3>
              <p className="pricing-desc">Dla zespołów</p>
              <div className="pricing-price">Custom</div>
              <ul className="pricing-features">
                <li><Icons.Check /> Wszystko z Pro</li>
                <li><Icons.Check /> Dedykowany opiekun</li>
                <li><Icons.Check /> SLA 99.9%</li>
                <li><Icons.Check /> Integracje</li>
              </ul>
              <a href="#cta" className="pricing-cta pricing-cta-secondary">Kontakt</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - A/B SPLIT */}
      <section id="cta" className="cta-section">
        <div className="cta-box">
          {variant === 'a' ? (
            // VERSION A: Email signup
            <>
              <h2 className="cta-title">Dołącz do beta</h2>
              <p className="cta-desc">Bądź wśród pierwszych. Dostaniesz darmowy miesiąc Pro.</p>
              
              {submitted ? (
                <div className="cta-success">
                  <Icons.Check />
                  <span>Dziękujemy! Jesteś na liście.</span>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="cta-form">
                  <input
                    type="email"
                    placeholder="twoj@email.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="cta-input"
                  />
                  <button type="submit" disabled={loading} className="cta-submit">
                    {loading ? 'Wysyłam...' : 'Dołącz'}
                  </button>
                </form>
              )}
              
              <p className="cta-note">Zero spamu. Możesz wypisać się w każdej chwili.</p>
            </>
          ) : (
            // VERSION B: Fake checkout
            <>
              {!showCheckout ? (
                <>
                  <h2 className="cta-title">Kup dostęp Pro</h2>
                  <p className="cta-desc">Bez limitu projektów. Priorytetowy support. 14 dni na zwrot.</p>
                  
                  <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '8px' }}>
                    199 <span style={{ fontSize: '18px', color: '#71717a' }}>PLN/mies</span>
                  </div>
                  <p style={{ color: '#22c55e', marginBottom: '24px', fontSize: '14px' }}>
                    🔥 -50% przez pierwsze 3 miesiące = 99 PLN/mies
                  </p>
                  
                  <button onClick={handleBuyClick} className="cta-submit" style={{ width: '100%', padding: '18px', fontSize: '16px', background: '#22c55e' }}>
                    Kup teraz — 99 PLN/mies
                  </button>
                  
                  <p className="cta-note">✓ 14-dniowa gwarancja zwrotu &nbsp; ✓ Płatność Stripe</p>
                </>
              ) : (
                // Fake checkout -> collect email
                <>
                  <h2 className="cta-title">Prawie gotowe! 🎉</h2>
                  <p className="cta-desc">
                    Jeszcze nie uruchomiliśmy płatności. Zostaw email — dostaniesz <strong>50% zniżki</strong> jako pierwszy użytkownik.
                  </p>
                  
                  {submitted ? (
                    <div className="cta-success">
                      <Icons.Check />
                      <span>Dziękujemy! Skontaktujemy się wkrótce.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleCheckoutSubmit} className="cta-form">
                      <input
                        type="email"
                        placeholder="twoj@email.pl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="cta-input"
                      />
                      <button type="submit" disabled={loading} className="cta-submit" style={{ background: '#22c55e' }}>
                        {loading ? 'Wysyłam...' : 'Chcę zniżkę'}
                      </button>
                    </form>
                  )}
                  
                  <p className="cta-note">Twój email = rezerwacja 50% zniżki lifetime.</p>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <a href="#" className="logo">
            <div className="logo-icon" style={{ width: 28, height: 28 }}><Icons.Calculator /></div>
            <span className="logo-text" style={{ fontSize: 16 }}>PrzedmiarAI</span>
          </a>
          <p className="footer-text">© 2026 PrzedmiarAI. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <HomeContent />
    </Suspense>
  );
}
