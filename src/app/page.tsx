'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  ChevronRight,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WAITLIST FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function WaitlistForm({ variant = 'default' }: { variant?: 'default' | 'hero' }) {
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5"
      >
        <Check className="w-5 h-5 shrink-0" />
        <span className="font-medium">Dziękujemy! Jesteś na liście.</span>
      </motion.div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="email"
            placeholder="twoj@email.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field pr-36 sm:pr-40"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-5 sm:px-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'Dołącz'}
          </button>
        </form>
        {error && <p className="text-red-400 mt-3 text-sm text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="twoj@email.pl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary shrink-0"
        >
          {isSubmitting ? 'Zapisuję...' : 'Dołącz do listy'}
        </button>
      </form>
      {error && <p className="text-red-400 mt-3 text-sm text-center">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const problems = [
  { 
    icon: Clock, 
    title: 'Ręczne mierzenie', 
    desc: 'Godziny z linijką na ekranie zamiast produktywnej pracy',
    gradient: 'from-red-500/20 to-orange-500/20'
  },
  { 
    icon: RotateCcw, 
    title: 'Przeklikiwanie', 
    desc: 'Ciągłe skoki między CAD, PDF i Excelem',
    gradient: 'from-orange-500/20 to-amber-500/20'
  },
  { 
    icon: Target, 
    title: 'Błędy w obliczeniach', 
    desc: 'Każda pomyłka to strata pieniędzy na projekcie',
    gradient: 'from-amber-500/20 to-yellow-500/20'
  },
  { 
    icon: Calculator, 
    title: 'Powtarzanie pracy', 
    desc: 'Te same pomiary od nowa przy każdym projekcie',
    gradient: 'from-yellow-500/20 to-lime-500/20'
  },
];

const solutions = [
  {
    icon: Upload,
    step: '01',
    title: 'Wgraj PDF',
    desc: 'AI automatycznie wykrywa pomieszczenia i elementy na rysunku technicznym.',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    glowColor: 'shadow-purple-500/10',
  },
  {
    icon: MousePointer2,
    step: '02',
    title: 'Zaznacz i mierz',
    desc: 'Kliknij obszar — system sam oblicza metry kwadratowe i obwód.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    glowColor: 'shadow-cyan-500/10',
  },
  {
    icon: FileSpreadsheet,
    step: '03',
    title: 'Eksportuj',
    desc: 'Gotowy przedmiar eksportuj do Excela lub PDF jednym kliknięciem.',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    glowColor: 'shadow-emerald-500/10',
  },
];

const steps = [
  { num: '01', title: 'Wgraj rysunek', desc: 'PDF lub PNG — przeciągnij i upuść' },
  { num: '02', title: 'AI rozpoznaje', desc: 'System wykrywa pomieszczenia automatycznie' },
  { num: '03', title: 'Zaznacz obszary', desc: 'Kliknij co chcesz zmierzyć' },
  { num: '04', title: 'Pobierz przedmiar', desc: 'Gotowy dokument w wybranym formacie' },
];

const plans = [
  {
    name: 'Starter',
    price: '199',
    period: '/mies',
    desc: 'Idealny na start',
    features: ['10 projektów miesięcznie', 'Export Excel / PDF', 'Wsparcie email'],
    popular: false,
  },
  {
    name: 'Pro',
    price: '499',
    period: '/mies',
    desc: 'Dla profesjonalistów',
    features: ['Bez limitu projektów', 'Priorytetowy support', 'Dostęp do API', 'Własne szablony eksportu'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Dla zespołów i firm',
    features: ['Wszystko z Pro', 'Dedykowany opiekun', 'SLA 99.9%', 'Integracje na zamówienie'],
    popular: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505]">
      {/* ═══════════════════════════════════════════════════════════════════════
          AMBIENT BACKGROUND
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div 
          className="glow-orb glow-primary w-[600px] h-[600px] -top-[200px] -right-[200px] animate-pulse-slow"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="glow-orb glow-accent w-[500px] h-[500px] top-[40%] -left-[200px] animate-pulse-slow"
          style={{ animationDelay: '-4s' }}
        />
        <div 
          className="glow-orb glow-primary w-[400px] h-[400px] bottom-[10%] right-[10%] animate-pulse-slow"
          style={{ animationDelay: '-8s' }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 navbar-glass">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="h-14 sm:h-20 flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">PrzedmiarAI</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#problem" className="text-sm text-zinc-400 hover:text-white transition-colors">Problem</a>
              <a href="#solution" className="text-sm text-zinc-400 hover:text-white transition-colors">Rozwiązanie</a>
              <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">Jak działa</a>
              <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Cennik</a>
            </div>

            {/* CTA + Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <a href="#waitlist" className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-sm">
                Dołącz do beta
              </a>
              <button
                className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#050505]/95 backdrop-blur-xl"
          >
            <div className="px-5 py-6 flex flex-col gap-1">
              <a href="#problem" className="py-3 text-zinc-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Problem</a>
              <a href="#solution" className="py-3 text-zinc-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Rozwiązanie</a>
              <a href="#how-it-works" className="py-3 text-zinc-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Jak działa</a>
              <a href="#pricing" className="py-3 text-zinc-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Cennik</a>
              <div className="pt-4">
                <a href="#waitlist" className="btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                  Dołącz do beta
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">Zasilane przez AI</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] mb-5 sm:mb-8 px-4"
            >
              Przedmiar w{' '}
              <span className="text-gradient">sekundy</span>
              <br />
              <span className="text-zinc-400">nie godziny</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-6 sm:mb-12 leading-relaxed px-6"
            >
              AI automatycznie mierzy powierzchnie z rysunków PDF.
              <span className="text-white font-medium"> Oszczędź 80% czasu</span> na przedmiarach i wycenach.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 sm:mb-14 px-4"
            >
              <a href="#waitlist" className="btn-primary w-full sm:w-auto">
                Wypróbuj za darmo
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#how-it-works" className="btn-secondary w-full sm:w-auto">
                Zobacz demo
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-zinc-500"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#050505] bg-gradient-to-br from-purple-500 to-cyan-500"
                    style={{ 
                      backgroundImage: `linear-gradient(${135 + i * 30}deg, #a855f7, #22d3ee)`,
                    }}
                  />
                ))}
              </div>
              <span>
                <strong className="text-white">500+</strong> kosztorysantów na liście oczekujących
              </span>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            className="mt-16 sm:mt-24 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />
              
              {/* Main visual container */}
              <div className="relative card p-2 sm:p-3 overflow-hidden">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5">
                  {/* Mock interface */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-purple-400" />
                      </div>
                      <p className="text-zinc-500 text-lg">Przeciągnij PDF, aby rozpocząć</p>
                    </div>
                  </div>
                  
                  {/* Grid lines decoration */}
                  <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PROBLEM SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="relative py-24 sm:py-32">
        <div className="divider-glow mb-24 sm:mb-32" />
        
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="text-center mb-16 sm:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="text-sm font-medium text-purple-400 mb-4 uppercase tracking-wider">
              Problem
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            >
              Znasz to <span className="text-gradient">uczucie</span>?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-zinc-400 text-lg max-w-xl mx-auto"
            >
              Codzienne frustracje każdego kosztorysanta — doskonale je rozumiemy.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {problems.map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="card group p-6 sm:p-8"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SOLUTION SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="solution" className="relative py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="text-center mb-16 sm:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="text-sm font-medium text-cyan-400 mb-4 uppercase tracking-wider">
              Rozwiązanie
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            >
              Trzy kroki do <span className="text-gradient">przedmiaru</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-zinc-400 text-lg max-w-xl mx-auto"
            >
              Prosty workflow, który zmienia godziny pracy w minuty.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {solutions.map((item, i) => (
              <motion.div 
                key={i} 
                variants={scaleIn}
                className={`card card-highlight p-8 sm:p-10 ${item.borderColor} hover:shadow-2xl ${item.glowColor} transition-all`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-bold text-zinc-800">{item.step}</span>
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 sm:py-32">
        <div className="divider-glow mb-24 sm:mb-32" />
        
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="text-center mb-16 sm:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="text-sm font-medium text-purple-400 mb-4 uppercase tracking-wider">
              Proces
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            >
              Jak to <span className="text-gradient">działa</span>?
            </motion.h2>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {steps.map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="text-center relative"
              >
                <div className="step-number mb-4">{item.num}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                
                {/* Connector line (desktop only) */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-zinc-700 to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="text-center mb-16 sm:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="text-sm font-medium text-cyan-400 mb-4 uppercase tracking-wider">
              Cennik
            </motion.p>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            >
              Prosty, <span className="text-gradient">przejrzysty</span> cennik
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-zinc-400 text-lg max-w-xl mx-auto"
            >
              Bez ukrytych opłat. Wybierz plan dopasowany do Twoich potrzeb.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {plans.map((plan, i) => (
              <motion.div 
                key={i}
                variants={scaleIn}
                className={`card relative flex flex-col p-8 ${
                  plan.popular 
                    ? 'border-purple-500/40 ring-1 ring-purple-500/20 md:-translate-y-4' 
                    : ''
                }`}
              >
                {plan.popular && <div className="badge-popular">Najpopularniejszy</div>}
                
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mb-6">{plan.desc}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-zinc-300 text-sm">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a
                  href="#waitlist"
                  className={plan.popular ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}
                >
                  {plan.price === 'Custom' ? 'Skontaktuj się' : 'Wybierz plan'}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA / WAITLIST SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="waitlist" className="relative py-24 sm:py-32">
        <div className="divider-glow mb-24 sm:mb-32" />
        
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="card p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-sm mb-8">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">Early Access</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Dołącz do <span className="text-gradient">beta</span>
              </h2>
              
              <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Bądź wśród pierwszych użytkowników. Otrzymasz <strong className="text-white">darmowy miesiąc Pro</strong> na start.
              </p>

              <WaitlistForm />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Bez spamu, obiecujemy
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Darmowy miesiąc Pro
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-base tracking-tight">PrzedmiarAI</span>
            </a>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
              <a href="#" className="hover:text-white transition-colors">Kontakt</a>
              <a href="#" className="hover:text-white transition-colors">Prywatność</a>
              <a href="#" className="hover:text-white transition-colors">Regulamin</a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} PrzedmiarAI
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
