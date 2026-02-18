'use client';

import { useState } from 'react';

const SECTIONS = ['Kim jesteś', 'Obecny proces', 'Feedback z beta', 'Monetyzacja'];

type Answers = {
  role: string;
  company_size: string;
  projects_per_year: string;
  last_przedmiar: string;
  current_tool: string;
  time_per_przedmiar: string;
  pain_point: string;
  beta_useful: string;
  beta_limitation: string;
  disappointment_score: number;
  told_someone: string;
  pricing_model: string;
  willing_to_pay: string;
  would_subscribe: string;
  contact_email: string;
};

const defaultAnswers: Answers = {
  role: '',
  company_size: '',
  projects_per_year: '',
  last_przedmiar: '',
  current_tool: '',
  time_per_przedmiar: '',
  pain_point: '',
  beta_useful: '',
  beta_limitation: '',
  disappointment_score: 0,
  told_someone: '',
  pricing_model: '',
  willing_to_pay: '',
  would_subscribe: '',
  contact_email: '',
};

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="survey-radio-group">
      {options.map((opt) => (
        <label key={opt} className={`survey-radio-option ${value === opt ? 'selected' : ''}`}>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ScaleInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="survey-scale">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`survey-scale-btn ${value === n ? 'selected' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <div className="survey-scale-labels">
        <span>Wcale</span>
        <span>Bardzo</span>
      </div>
    </div>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="survey-question">
      <label className="survey-label">{label}</label>
      {children}
    </div>
  );
}

export default function AnkietaPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const canNext = (): boolean => {
    if (step === 0) return !!(answers.role && answers.company_size && answers.projects_per_year);
    if (step === 1) return !!(answers.last_przedmiar && answers.current_tool && answers.time_per_przedmiar);
    if (step === 2) return !!(answers.beta_useful && answers.disappointment_score > 0 && answers.told_someone);
    if (step === 3) return !!(answers.pricing_model && answers.willing_to_pay && answers.would_subscribe);
    return false;
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error('Błąd zapisu');
      setDone(true);
    } catch {
      setError('Coś poszło nie tak. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="survey-page">
        <div className="survey-card">
          <div className="survey-logo">
            <div className="survey-logo-icon" />
            <span className="survey-logo-text">PrzedmiarAI</span>
          </div>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🙏</div>
          <h1 className="survey-title">Dziękujemy!</h1>
          <p className="survey-desc">
            Twoje odpowiedzi pomogą nam zbudować lepszy produkt. Jeśli zostawiłeś kontakt — odezwiemy się wkrótce.
          </p>
          <a href="https://przedmiarai.pl" className="survey-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Wróć na stronę
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-page">
      <div className="survey-card">
        <div className="survey-logo">
          <div className="survey-logo-icon" />
          <span className="survey-logo-text">PrzedmiarAI</span>
        </div>

        <h1 className="survey-title">Ankieta po beta teście</h1>
        <p className="survey-desc">Zajmie Ci to ~2 minuty. Żadnych nagród — liczy się szczerość.</p>

        {/* Progress bar */}
        <div className="survey-progress">
          {SECTIONS.map((label, i) => (
            <div key={label} className={`survey-progress-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="survey-progress-dot">{i < step ? '✓' : i + 1}</div>
              <span className="survey-progress-label">{label}</span>
            </div>
          ))}
          <div className="survey-progress-bar">
            <div className="survey-progress-fill" style={{ width: `${((step) / (SECTIONS.length - 1)) * 100}%` }} />
          </div>
        </div>

        <div className="survey-form">
          {/* Section A */}
          {step === 0 && (
            <>
              <Question label="1. Twoja rola?">
                <RadioGroup name="role" value={answers.role} onChange={(v) => set('role', v)}
                  options={['Właściciel firmy', 'Project Manager', 'Kosztorysant', 'Inżynier', 'Inne']} />
              </Question>
              <Question label="2. Ile osób w firmie?">
                <RadioGroup name="company_size" value={answers.company_size} onChange={(v) => set('company_size', v)}
                  options={['1-5', '6-20', '21-50', '50+']} />
              </Question>
              <Question label="3. Ile projektów rocznie?">
                <RadioGroup name="projects_per_year" value={answers.projects_per_year} onChange={(v) => set('projects_per_year', v)}
                  options={['1-5', '6-20', '20+']} />
              </Question>
            </>
          )}

          {/* Section B */}
          {step === 1 && (
            <>
              <Question label="4. Kiedy ostatnio robiłeś przedmiar z rzutu PDF?">
                <RadioGroup name="last_przedmiar" value={answers.last_przedmiar} onChange={(v) => set('last_przedmiar', v)}
                  options={['W tym tygodniu', 'W tym miesiącu', 'Dawniej', 'Nie robię sam']} />
              </Question>
              <Question label="5. Czym to robisz?">
                <RadioGroup name="current_tool" value={answers.current_tool} onChange={(v) => set('current_tool', v)}
                  options={['Excel ręcznie', 'Norma / Zuzia', 'Outsource', 'Inne']} />
              </Question>
              <Question label="6. Ile czasu zajmuje Ci jeden przedmiar?">
                <RadioGroup name="time_per_przedmiar" value={answers.time_per_przedmiar} onChange={(v) => set('time_per_przedmiar', v)}
                  options={['< 1 godziny', '1-4 godziny', '4-8 godzin', '> 8 godzin']} />
              </Question>
              <Question label="7. Co najbardziej wkurza w obecnym procesie?">
                <textarea
                  className="survey-input"
                  rows={3}
                  placeholder="Pisz szczerze — to najważniejsze pytanie..."
                  value={answers.pain_point}
                  onChange={(e) => set('pain_point', e.target.value)}
                />
              </Question>
            </>
          )}

          {/* Section C */}
          {step === 2 && (
            <>
              <Question label="8. Czy wynik AI był przydatny?">
                <RadioGroup name="beta_useful" value={answers.beta_useful} onChange={(v) => set('beta_useful', v)}
                  options={['Tak, w pełni', 'Częściowo', 'Nie']} />
              </Question>
              <Question label="9. Co było największym ograniczeniem?">
                <textarea
                  className="survey-input"
                  rows={3}
                  placeholder="Co byś zmienił/poprawił?"
                  value={answers.beta_limitation}
                  onChange={(e) => set('beta_limitation', e.target.value)}
                />
              </Question>
              <Question label="10. Jak oceniasz potencjał tego narzędzia? (1 = bez sensu, 10 = must-have)">
                <ScaleInput value={answers.disappointment_score} onChange={(v) => set('disappointment_score', v)} />
              </Question>
              <Question label="11. Czy powiedziałeś komuś o PrzedmiarAI?">
                <RadioGroup name="told_someone" value={answers.told_someone} onChange={(v) => set('told_someone', v)}
                  options={['Tak', 'Nie']} />
              </Question>
            </>
          )}

          {/* Section D */}
          {step === 3 && (
            <>
              <Question label="12. Jaki model cenowy preferujesz?">
                <RadioGroup name="pricing_model" value={answers.pricing_model} onChange={(v) => set('pricing_model', v)}
                  options={['Za projekt', 'Miesięcznie', 'Rocznie']} />
              </Question>
              <Question label="13. Ile byłbyś gotów płacić miesięcznie?">
                <RadioGroup name="willing_to_pay" value={answers.willing_to_pay} onChange={(v) => set('willing_to_pay', v)}
                  options={['0 PLN', 'Do 99 PLN', '100-299 PLN', '300-499 PLN', '500+ PLN']} />
              </Question>
              <Question label="14. Gdybyśmy ruszyli jutro — zapisałbyś się?">
                <RadioGroup name="would_subscribe" value={answers.would_subscribe} onChange={(v) => set('would_subscribe', v)}
                  options={['Tak, od razu', 'Tak, po ulepszeniach', 'Nie']} />
              </Question>
              <Question label="Opcjonalnie: email lub telefon do kontaktu">
                <input
                  className="survey-input"
                  type="text"
                  placeholder="email@firma.pl lub +48..."
                  value={answers.contact_email}
                  onChange={(e) => set('contact_email', e.target.value)}
                />
              </Question>
            </>
          )}

          {error && <p className="survey-error">{error}</p>}

          <div className="survey-nav">
            {step > 0 && (
              <button type="button" className="survey-back" onClick={() => setStep(step - 1)}>
                ← Wstecz
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="survey-submit" disabled={!canNext()} onClick={() => setStep(step + 1)}>
                Dalej →
              </button>
            ) : (
              <button type="button" className="survey-submit" disabled={!canNext() || submitting} onClick={submit}>
                {submitting ? 'Wysyłam...' : 'Wyślij ankietę'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
