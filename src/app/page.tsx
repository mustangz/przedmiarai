'use client';

import { useState } from 'react';
import { 
  Calculator, Upload, MousePointer2, FileSpreadsheet, 
  Clock, Target, RefreshCw, Repeat2, Check, ArrowRight, 
  Sparkles, Zap, Shield, Menu, X, TrendingUp
} from 'lucide-react';

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
    <main className="min-h-screen relative">
      {/* Background glow */}
      <div className="bg-glow" aria-hidden="true" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="h-16 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">PrzedmiarAI</span>
            </a>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#problem" className="text-sm text-zinc-400 hover:text-white transition">Problem</a>
              <a href="#solution" className="text-sm text-zinc-400 hover:text-white transition">Rozwiązanie</a>
              <a href="#how" className="text-sm text-zinc-400 hover:text-white transition">Jak działa</a>
              <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition">Cennik</a>
            </div>
            
            <a href="#waitlist" className="hidden md:flex btn btn-primary !py-2.5 !px-5 text-sm">
              Dołącz do beta
            </a>
            
            <button 
              className="md:hidden p-2 text-zinc-400 hover:text-white" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
            <div className="px-5 py-5 flex flex-col gap-1">
              <a href="#problem" className="py-2.5 text-zinc-300" onClick={() => setMenuOpen(false)}>Problem</a>
              <a href="#solution" className="py-2.5 text-zinc-300" onClick={() => setMenuOpen(false)}>Rozwiązanie</a>
              <a href="#how" className="py-2.5 text-zinc-300" onClick={() => setMenuOpen(false)}>Jak działa</a>
              <a href="#pricing" className="py-2.5 text-zinc-300" onClick={() => setMenuOpen(false)}>Cennik</a>
              <a href="#waitlist" className="btn btn-primary mt-3" onClick={() => setMenuOpen(false)}>
                Dołącz do beta
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════ */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="badge mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Zasilane przez AI</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Oszczędź <span className="text-gradient">80% czasu</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            na przedmiarach
          </h1>
          
          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Wgraj PDF z rysunkiem — AI automatycznie zmierzy wszystkie pomieszczenia. 
            Koniec z ręcznym klikaniem w CAD.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#waitlist" className="btn btn-primary">
              Wypróbuj za darmo
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how" className="btn btn-secondary">
              Zobacz jak działa
            </a>
          </div>
          
          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 border-2 border-[#0a0a0f]" />
                ))}
              </div>
              <span><strong className="text-white">500+</strong> na liście</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>Oszczędność <strong className="text-white">4h</strong> dziennie</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PROBLEM
          ═══════════════════════════════════════════════════ */}
      <section id="problem" className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">Problem</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Brzmi znajomo?</h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
              Każdy kosztorysant traci godziny na rzeczy, które AI może zrobić w sekundy.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { 
                icon: Clock, 
                title: 'Ręczne mierzenie', 
                desc: 'Godziny z linijką na ekranie zamiast produktywnej pracy',
                color: 'bg-red-500/10 text-red-400'
              },
              { 
                icon: RefreshCw, 
                title: 'Ciągłe przeklikiwanie', 
                desc: 'CAD → PDF → Excel → CAD. W kółko, przy każdym projekcie',
                color: 'bg-orange-500/10 text-orange-400'
              },
              { 
                icon: Target, 
                title: 'Kosztowne błędy', 
                desc: 'Jeden błąd w pomiarze = tysiące strat na projekcie',
                color: 'bg-yellow-500/10 text-yellow-400'
              },
              { 
                icon: Repeat2, 
                title: 'Powtarzanie pracy', 
                desc: 'Te same pomiary od nowa, przy każdej zmianie projektu',
                color: 'bg-pink-500/10 text-pink-400'
              },
            ].map((item, i) => (
              <div key={i} className="card card-glow">
                <div className={`icon-box ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SOLUTION
          ═══════════════════════════════════════════════════ */}
      <section id="solution" className="py-20 sm:py-28 px-5 sm:px-8 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">Rozwiązanie</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Trzy proste kroki</h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
              Od PDF do gotowego przedmiaru w mniej niż minutę.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-5 sm:gap-8">
            {[
              { 
                icon: Upload, 
                step: '01', 
                title: 'Wgraj PDF', 
                desc: 'Przeciągnij rysunek — AI automatycznie rozpozna wszystkie pomieszczenia i elementy.',
                color: 'bg-violet-500/10 text-violet-400',
                stat: 'PDF, PNG, DWG*'
              },
              { 
                icon: MousePointer2, 
                step: '02', 
                title: 'Zaznacz obszary', 
                desc: 'Kliknij pomieszczenie — system natychmiast oblicza metry kwadratowe i obwód.',
                color: 'bg-blue-500/10 text-blue-400',
                stat: 'Dokładność 99.2%'
              },
              { 
                icon: FileSpreadsheet, 
                step: '03', 
                title: 'Eksportuj', 
                desc: 'Pobierz gotowy przedmiar jako Excel lub PDF. Jednym kliknięciem.',
                color: 'bg-cyan-500/10 text-cyan-400',
                stat: 'Excel, PDF, CSV'
              },
            ].map((item, i) => (
              <div key={i} className="card card-glow text-center sm:text-left">
                <div className={`icon-box ${item.color} mx-auto sm:mx-0`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-zinc-600 text-xs font-mono mb-2">{item.step}</p>
                <h3 className="font-semibold text-lg sm:text-xl mb-3">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                <p className="text-xs text-violet-400 font-medium">{item.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════ */}
      <section id="how" className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">Jak to działa</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">AI robi robotę za Ciebie</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Wgraj rysunek', desc: 'PDF lub PNG — przeciągnij i upuść' },
              { num: '02', title: 'AI analizuje', desc: 'Rozpoznaje pomieszczenia i wymiary' },
              { num: '03', title: 'Zatwierdź', desc: 'Sprawdź i popraw jeśli trzeba' },
              { num: '04', title: 'Pobierz', desc: 'Gotowy przedmiar w wybranym formacie' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl sm:text-6xl font-bold text-violet-500/10 mb-3">{item.num}</div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label">Cennik</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Prosty, uczciwy cennik</h2>
            <p className="text-zinc-400 text-base sm:text-lg">Bez ukrytych opłat. Płacisz za to, czego używasz.</p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { 
                name: 'Starter', 
                price: '199', 
                desc: 'Dla freelancerów',
                features: ['10 projektów / miesiąc', 'Export Excel / PDF', 'Email support'],
                popular: false 
              },
              { 
                name: 'Pro', 
                price: '499', 
                desc: 'Dla profesjonalistów',
                features: ['Bez limitu projektów', 'Priorytetowy support', 'API access', 'Własne szablony'],
                popular: true 
              },
              { 
                name: 'Enterprise', 
                price: 'Custom', 
                desc: 'Dla firm i zespołów',
                features: ['Wszystko z Pro', 'Dedykowany opiekun', 'SLA 99.9%', 'Integracje'],
                popular: false 
              },
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`card relative ${plan.popular ? 'border-violet-500/50 stat-card' : ''}`}
              >
                {plan.popular && <div className="badge-popular">Najpopularniejszy</div>}
                
                <h3 className="font-semibold text-xl mb-1">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">{plan.desc}</p>
                
                <div className="mb-6">
                  <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-zinc-500"> PLN/mies</span>}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-zinc-300 text-sm">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="#waitlist" 
                  className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {plan.price === 'Custom' ? 'Skontaktuj się' : 'Wybierz plan'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA / WAITLIST
          ═══════════════════════════════════════════════════ */}
      <section id="waitlist" className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-xl mx-auto">
          <div className="card stat-card p-8 sm:p-10 text-center">
            <div className="badge mb-6 mx-auto">
              <Zap className="w-4 h-4" />
              <span>Early Access</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Dołącz do beta</h2>
            <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
              Bądź wśród pierwszych użytkowników. Dostaniesz <strong className="text-white">darmowy miesiąc Pro</strong> na start.
            </p>
            
            {submitted ? (
              <div className="flex items-center justify-center gap-3 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                <Check className="w-5 h-5" />
                <span className="font-medium">Dziękujemy! Jesteś na liście.</span>
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
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn btn-primary sm:!w-auto disabled:opacity-50"
                >
                  {loading ? 'Wysyłam...' : 'Dołącz'}
                </button>
              </form>
            )}
            
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Bez spamu
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Darmowy Pro
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════ */}
      <footer className="py-10 px-5 sm:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">PrzedmiarAI</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition">Kontakt</a>
            <a href="#" className="hover:text-white transition">Prywatność</a>
          </div>
          
          <p className="text-sm text-zinc-600">© 2026 PrzedmiarAI</p>
        </div>
      </footer>
    </main>
  );
}
