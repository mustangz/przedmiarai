'use client';

import { useState } from 'react';
import { Calculator, Upload, MousePointer2, FileSpreadsheet, Clock, Target, RotateCcw, Check, ArrowRight, Sparkles, Zap, Shield, Menu, X } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail('');
      }
    } catch {}
    setLoading(false);
  };

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">PrzedmiarAI</span>
          </a>
          
          <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#problem" className="hover:text-white transition">Problem</a>
            <a href="#solution" className="hover:text-white transition">Rozwiązanie</a>
            <a href="#pricing" className="hover:text-white transition">Cennik</a>
          </div>
          
          <a href="#waitlist" className="hidden sm:flex btn btn-primary !py-2 !px-4 text-sm">
            Dołącz
          </a>
          
          <button className="sm:hidden p-2 text-zinc-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="sm:hidden px-5 py-4 border-t border-white/5 bg-zinc-950/95">
            <div className="flex flex-col gap-3 text-zinc-300">
              <a href="#problem" onClick={() => setMenuOpen(false)}>Problem</a>
              <a href="#solution" onClick={() => setMenuOpen(false)}>Rozwiązanie</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>Cennik</a>
              <a href="#waitlist" className="btn btn-primary mt-2" onClick={() => setMenuOpen(false)}>Dołącz do beta</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero - dużo padding-top żeby navbar nie zasłaniał */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs sm:text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zasilane przez AI</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 sm:mb-6">
            Przedmiar w <span className="text-gradient">sekundy</span>
            <br />
            <span className="text-zinc-500">nie godziny</span>
          </h1>
          
          <p className="text-sm sm:text-lg text-zinc-400 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
            AI automatycznie mierzy powierzchnie z rysunków PDF.
            <span className="text-white"> Oszczędź 80% czasu</span> na przedmiarach.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="#waitlist" className="btn btn-primary">
              Wypróbuj za darmo <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#solution" className="btn btn-secondary">
              Jak to działa?
            </a>
          </div>
          
          <p className="text-xs sm:text-sm text-zinc-500">
            <span className="text-white font-medium">500+</span> kosztorysantów na liście
          </p>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-purple-400 text-sm mb-2">Problem</p>
            <h2 className="text-xl sm:text-3xl font-bold mb-3">Znasz to uczucie?</h2>
            <p className="text-zinc-400 text-sm sm:text-base">Codzienne frustracje kosztorysanta.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Clock, title: 'Ręczne mierzenie', desc: 'Godziny z linijką na ekranie' },
              { icon: RotateCcw, title: 'Przeklikiwanie', desc: 'CAD, PDF, Excel w kółko' },
              { icon: Target, title: 'Błędy', desc: 'Każda pomyłka to strata' },
              { icon: RotateCcw, title: 'Powtarzanie', desc: 'Te same pomiary od nowa' },
            ].map((item, i) => (
              <div key={i} className="card">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <h3 className="font-medium text-sm sm:text-base mb-1">{item.title}</h3>
                <p className="text-zinc-500 text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-16 sm:py-24 px-5 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-purple-400 text-sm mb-2">Rozwiązanie</p>
            <h2 className="text-xl sm:text-3xl font-bold mb-3">Trzy proste kroki</h2>
            <p className="text-zinc-400 text-sm sm:text-base">Od PDF do przedmiaru w minutę.</p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Upload, step: '01', title: 'Wgraj PDF', desc: 'AI wykrywa pomieszczenia automatycznie', color: 'purple' },
              { icon: MousePointer2, step: '02', title: 'Zaznacz', desc: 'Kliknij obszar — system liczy m²', color: 'blue' },
              { icon: FileSpreadsheet, step: '03', title: 'Eksportuj', desc: 'Pobierz przedmiar jako Excel lub PDF', color: 'cyan' },
            ].map((item, i) => (
              <div key={i} className="card text-center sm:text-left">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center mb-4 mx-auto sm:mx-0`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${item.color}-400`} />
                </div>
                <p className="text-zinc-600 text-xs mb-1">{item.step}</p>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-purple-400 text-sm mb-2">Cennik</p>
            <h2 className="text-xl sm:text-3xl font-bold mb-3">Prosty cennik</h2>
            <p className="text-zinc-400 text-sm sm:text-base">Bez ukrytych opłat.</p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: 'Starter', price: '199', features: ['10 projektów/mies', 'Export Excel/PDF', 'Email support'], popular: false },
              { name: 'Pro', price: '499', features: ['Bez limitu', 'Priorytet support', 'API access', 'Własne szablony'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Wszystko z Pro', 'Dedykowany opiekun', 'SLA 99.9%'], popular: false },
            ].map((plan, i) => (
              <div key={i} className={`card relative ${plan.popular ? 'border-purple-500/50 bg-purple-500/5' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-medium rounded-full">
                    Popularny
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-zinc-500 text-sm"> /mies</span>}
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#waitlist" className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  Wybierz
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Waitlist */}
      <section id="waitlist" className="py-16 sm:py-24 px-5">
        <div className="max-w-lg mx-auto text-center">
          <div className="card p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 text-xs mb-4">
              <Zap className="w-3.5 h-3.5" />
              Early Access
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Dołącz do beta</h2>
            <p className="text-zinc-400 text-sm mb-6">Bądź pierwszy. Darmowy miesiąc Pro na start.</p>
            
            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 rounded-xl p-4">
                <Check className="w-5 h-5" />
                <span>Dziękujemy! Jesteś na liście.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input flex-1"
                />
                <button type="submit" disabled={loading} className="btn btn-primary !w-full sm:!w-auto">
                  {loading ? 'Wysyłam...' : 'Dołącz'}
                </button>
              </form>
            )}
            
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Bez spamu</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Darmowy Pro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Calculator className="w-3 h-3 text-white" />
            </div>
            <span>PrzedmiarAI</span>
          </div>
          <p>© 2026 PrzedmiarAI</p>
        </div>
      </footer>
    </main>
  );
}
