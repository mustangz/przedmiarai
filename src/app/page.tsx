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
  Shield,
  Menu,
  X,
} from 'lucide-react';

function WaitlistForm() {
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

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-3 text-emerald-400 bg-emerald-500/10 rounded-xl p-4">
        <Check className="w-5 h-5 shrink-0" />
        <span className="font-medium">Dziękujemy! Jesteś na liście.</span>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
        <input
          type="email"
          placeholder="twoj@email.pl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none transition text-sm sm:text-base placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary whitespace-nowrap disabled:opacity-50"
        >
          {isSubmitting ? 'Zapisuję...' : 'Dołącz'}
        </button>
      </form>
      {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
    </>
  );
}

const problems = [
  { icon: Clock, title: 'Ręczne mierzenie', desc: 'Godziny z linijką na ekranie zamiast produktywnej pracy' },
  { icon: RotateCcw, title: 'Przeklikiwanie', desc: 'Ciągłe skoki między CAD, PDF i Excelem' },
  { icon: Target, title: 'Błędy w obliczeniach', desc: 'Każda pomyłka to strata pieniędzy na projekcie' },
  { icon: Calculator, title: 'Powtarzanie pracy', desc: 'Te same pomiary od nowa przy każdym projekcie' },
];

const solutions = [
  {
    icon: Upload,
    title: 'Upload PDF',
    desc: 'AI automatycznie wykrywa pomieszczenia i elementy na rysunku technicznym.',
    accent: 'from-violet-500 to-purple-600',
  },
  {
    icon: MousePointer2,
    title: 'Kliknij i mierz',
    desc: 'Zaznacz obszar — system sam oblicza metry kwadratowe i obwód.',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileSpreadsheet,
    title: 'Export',
    desc: 'Gotowy przedmiar eksportuj do Excela lub PDF jednym kliknięciem.',
    accent: 'from-cyan-500 to-emerald-500',
  },
];

const steps = [
  { step: '01', title: 'Wgraj rysunek', desc: 'PDF lub PNG — przeciągnij i upuść' },
  { step: '02', title: 'AI rozpoznaje', desc: 'System wykrywa pomieszczenia' },
  { step: '03', title: 'Zaznacz obszary', desc: 'Kliknij co chcesz zmierzyć' },
  { step: '04', title: 'Pobierz przedmiar', desc: 'Gotowy dokument w wybranym formacie' },
];

const plans = [
  {
    name: 'Starter',
    price: '199',
    desc: 'Dla pojedynczych projektów',
    features: ['10 projektów / miesiąc', 'Export Excel / PDF', 'Email support'],
    popular: false,
  },
  {
    name: 'Pro',
    price: '499',
    desc: 'Dla profesjonalistów',
    features: ['Bez limitu projektów', 'Priorytetowy support', 'API access', 'Własne szablony'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Kontakt',
    desc: 'Dla dużych firm',
    features: ['Wszystko z Pro', 'Dedykowany opiekun', 'SLA 99.9%', 'Integracje custom'],
    popular: false,
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden relative">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">PrzedmiarAI</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm text-gray-400 hover:text-white transition">Problem</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Funkcje</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">Jak działa</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Cennik</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#waitlist" className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-sm">
              Dołącz do beta
            </a>
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0a12]/95 backdrop-blur-xl">
            <div className="px-4 py-4 flex flex-col gap-3">
              <a href="#problem" className="text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>Problem</a>
              <a href="#features" className="text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>Funkcje</a>
              <a href="#how-it-works" className="text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>Jak działa</a>
              <a href="#pricing" className="text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>Cennik</a>
              <a href="#waitlist" className="btn-primary text-center mt-1" onClick={() => setMobileMenuOpen(false)}>Dołącz do beta</a>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-24 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-28 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs sm:text-sm text-violet-300 font-medium">Powered by AI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.15] tracking-tight mb-6 sm:mb-6 px-2">
            Przedmiar w{' '}
            <span className="gradient-text">sekundy</span>
            <br className="hidden xs:block" />
            <span className="xs:hidden"> </span>
            nie godziny
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 sm:px-0 leading-relaxed">
            AI automatycznie mierzy powierzchnie z rysunków PDF.{' '}
            <span className="text-white font-medium">Oszczędź 80% czasu</span> na wycenach.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            <a href="#waitlist" className="btn-primary w-full sm:w-auto gap-2">
              Wypróbuj za darmo <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how-it-works" className="btn-secondary w-full sm:w-auto gap-2">
              Zobacz jak działa
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            <span className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${
                    i % 2 === 0 ? 'from-violet-500 to-blue-500' : 'from-blue-500 to-cyan-500'
                  } border-2 border-[var(--background)]`}
                />
              ))}
            </span>
            <span>
              <strong className="text-white">500+</strong> kosztorysantów już czeka
            </span>
          </div>
        </div>

        {/* Hero visual */}
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6">
          <div className="card p-1.5 sm:p-2 overflow-hidden">
            <div className="bg-gradient-to-br from-violet-900/20 to-blue-900/20 rounded-xl aspect-[16/10] sm:aspect-video flex items-center justify-center border border-violet-500/10">
              <div className="text-center px-4">
                <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center border border-violet-500/20">
                  <Upload className="w-7 h-7 sm:w-10 sm:h-10 text-violet-400" />
                </div>
                <p className="text-gray-500 text-sm sm:text-base">Podgląd interfejsu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem ─── */}
      <section id="problem" className="relative py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Ile godzin <span className="gradient-text">tracisz</span> mierząc PDF-y?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Codzienne frustracje kosztorysanta — poznajemy je dobrze.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {problems.map((item, i) => (
              <div key={i} className="card group">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed sm:leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Solution ─── */}
      <section id="features" className="relative py-20 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Rozwiązanie? <span className="gradient-text">PrzedmiarAI</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Trzy proste kroki do gotowego przedmiaru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {solutions.map((item, i) => (
              <div key={i} className="card relative overflow-hidden group">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-5 sm:mb-6`}
                >
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-2.5 sm:mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed sm:leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="relative py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Jak to <span className="gradient-text">działa</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8">
            {steps.map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-violet-500/15 mb-3 sm:mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-base sm:text-base lg:text-lg mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-sm leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-500/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="relative py-20 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Prosty <span className="gradient-text">cennik</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">Wybierz plan dopasowany do Twoich potrzeb</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`card relative flex flex-col ${
                  plan.popular
                    ? 'border-violet-500/50 md:-translate-y-2 shadow-[0_0_40px_rgba(124,58,237,0.1)]'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    Najpopularniejszy
                  </div>
                )}
                <h3 className="font-bold text-lg sm:text-xl mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                <div className="mb-5 sm:mb-6">
                  {plan.price === 'Kontakt' ? (
                    <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400 text-sm"> PLN/mies</span>
                    </>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6 sm:mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-gray-300 text-sm sm:text-base">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#waitlist"
                  className={`${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full text-center`}
                >
                  {plan.price === 'Kontakt' ? 'Skontaktuj się' : 'Wybierz plan'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA / Waitlist ─── */}
      <section id="waitlist" className="relative py-20 sm:py-24 lg:py-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="card p-6 sm:p-10 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/5" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-violet-500/15 rounded-full px-4 py-1.5 mb-5 sm:mb-6">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs sm:text-sm text-violet-300 font-medium">Early Access</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
                Dołącz do <span className="gradient-text">beta</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
                Zapisz się na listę i bądź pierwszy, gdy wystartujemy.
                Pierwsi użytkownicy otrzymają darmowy miesiąc Pro.
              </p>

              <WaitlistForm />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Bez spamu
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Darmowy miesiąc Pro
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <a href="#" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base">PrzedmiarAI</span>
            </a>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Kontakt</a>
              <a href="#" className="hover:text-white transition">Prywatność</a>
              <a href="#" className="hover:text-white transition">Regulamin</a>
            </div>

            <p className="text-xs sm:text-sm text-gray-500">
              &copy; 2026 PrzedmiarAI
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
