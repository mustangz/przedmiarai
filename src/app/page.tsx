'use client';

import { useState } from 'react';
import { 
  Upload, 
  MousePointer2, 
  FileSpreadsheet, 
  Clock, 
  Target, 
  Calculator, 
  RotateCcw, 
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        const data = await res.json();
        setError(data.error || 'Coś poszło nie tak');
      }
    } catch {
      setError('Błąd połączenia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">PrzedmiarAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition">Funkcje</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition">Jak działa</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition">Cennik</a>
          </div>
          <a href="#waitlist" className="btn-primary !py-3 !px-6 text-sm">
            Dołącz do beta
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section pt-40 pb-20 relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Powered by AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Przedmiar w <span className="gradient-text">sekundy</span>,<br />
            nie godziny
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
            AI automatycznie mierzy powierzchnie z rysunków PDF. 
            <span className="text-white font-medium"> Oszczędź 80% czasu</span> na wycenach.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href="#waitlist" className="btn-primary flex items-center gap-2">
              Wypróbuj za darmo <ArrowRight className="w-5 h-5" />
            </a>
            <button className="btn-secondary flex items-center gap-2">
              Zobacz demo
            </button>
          </div>
          
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <span className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                  i % 2 === 0 ? 'from-violet-500 to-blue-500' : 'from-blue-500 to-cyan-500'
                } border-2 border-[var(--background)]`} />
              ))}
            </span>
            <span><strong className="text-white">500+</strong> kosztorysantów już czeka</span>
          </p>
        </div>
        
        {/* Hero visual placeholder */}
        <div className="max-w-5xl mx-auto mt-20 px-6">
          <div className="card p-2 overflow-hidden">
            <div className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 rounded-xl aspect-video flex items-center justify-center border border-violet-500/10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center border border-violet-500/30">
                  <Upload className="w-10 h-10 text-violet-400" />
                </div>
                <p className="text-gray-400">Podgląd interfejsu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section bg-gradient-to-b from-transparent to-violet-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ile godzin <span className="gradient-text">tracisz</span> mierząc PDF-y?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Codzienne frustracje kosztorysanta — poznajemy je dobrze.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: 'Ręczne mierzenie', desc: 'Godziny z linijką na ekranie' },
              { icon: RotateCcw, title: 'Przeklikiwanie', desc: 'Skok między CAD a Excelem' },
              { icon: Target, title: 'Błędy w obliczeniach', desc: 'Pomyłki kosztują pieniądze' },
              { icon: Calculator, title: 'Powtarzanie pracy', desc: 'Te same pomiary, nowy projekt' },
            ].map((item, i) => (
              <div key={i} className="card group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition">
                  <item.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Rozwiązanie? <span className="gradient-text">PrzedmiarAI</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Trzy proste kroki do gotowego przedmiaru.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Upload, 
                title: 'Upload PDF', 
                desc: 'AI automatycznie wykrywa pomieszczenia i elementy na rysunku.',
                accent: 'from-violet-500 to-purple-600'
              },
              { 
                icon: MousePointer2, 
                title: 'Kliknij i mierz', 
                desc: 'Wybierz co liczyć — system sam oblicza metry kwadratowe.',
                accent: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: FileSpreadsheet, 
                title: 'Export', 
                desc: 'Gotowy przedmiar eksportuj do Excela lub PDF jednym kliknięciem.',
                accent: 'from-cyan-500 to-emerald-500'
              },
            ].map((item, i) => (
              <div key={i} className="card relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-6`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Jak to <span className="gradient-text">działa</span>?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Wgraj rysunek', desc: 'PDF lub PNG — po prostu przeciągnij plik' },
              { step: '02', title: 'AI rozpoznaje', desc: 'System wykrywa pomieszczenia automatycznie' },
              { step: '03', title: 'Zaznacz obszary', desc: 'Kliknij co chcesz zmierzyć' },
              { step: '04', title: 'Pobierz przedmiar', desc: 'Gotowy dokument w wybranym formacie' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="text-6xl font-bold text-violet-500/20 mb-4">{item.step}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-500/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Prosty <span className="gradient-text">cennik</span>
            </h2>
            <p className="text-gray-400 text-lg">Wybierz plan dopasowany do Twoich potrzeb</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: 'Starter', 
                price: '199', 
                desc: 'Dla pojedynczych projektów',
                features: ['10 projektów miesięcznie', 'Export do Excel/PDF', 'Email support'],
                popular: false
              },
              { 
                name: 'Pro', 
                price: '499', 
                desc: 'Dla profesjonalistów',
                features: ['Unlimited projektów', 'Priorytetowy support', 'API access', 'Własne szablony'],
                popular: true
              },
              { 
                name: 'Enterprise', 
                price: 'Kontakt', 
                desc: 'Dla dużych firm',
                features: ['Wszystko z Pro', 'Dedykowany opiekun', 'SLA 99.9%', 'Integracje custom'],
                popular: false
              },
            ].map((plan, i) => (
              <div key={i} className={`card relative ${plan.popular ? 'border-violet-500 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Najpopularniejszy
                  </div>
                )}
                <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                <div className="mb-6">
                  {plan.price === 'Kontakt' ? (
                    <span className="text-3xl font-bold">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400"> PLN/mies</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#waitlist" className={plan.popular ? 'btn-primary w-full text-center block' : 'btn-secondary w-full text-center block'}>
                  {plan.price === 'Kontakt' ? 'Skontaktuj się' : 'Wybierz plan'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="section">
        <div className="max-w-3xl mx-auto px-6">
          <div className="card p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-violet-500/20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">Early Access</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Dołącz do <span className="gradient-text">beta</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Zapisz się na listę i bądź pierwszy, gdy wystartujemy. 
                Pierwsi użytkownicy otrzymają darmowy miesiąc Pro.
              </p>
              
              {submitted ? (
                <div className="flex items-center justify-center gap-3 text-emerald-400 bg-emerald-500/10 rounded-xl p-4">
                  <Check className="w-6 h-6" />
                  <span className="font-medium">Dziękujemy! Jesteś na liście.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="twoj@email.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)] focus:border-violet-500 focus:outline-none transition"
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary whitespace-nowrap disabled:opacity-50"
                  >
                    {isSubmitting ? 'Zapisuję...' : 'Dołącz do beta'}
                  </button>
                </form>
              )}
              
              {error && (
                <p className="text-red-400 mt-4">{error}</p>
              )}
              
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Bez spamu
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Darmowy miesiąc Pro
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">PrzedmiarAI</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Kontakt</a>
              <a href="#" className="hover:text-white transition">Polityka prywatności</a>
              <a href="#" className="hover:text-white transition">Regulamin</a>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2026 PrzedmiarAI. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
