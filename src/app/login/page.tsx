'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Błąd');
      }

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd serwera');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <div className="logo-icon-sm" />
          <span className="auth-logo-text">PrzedmiarAI</span>
        </Link>

        {!sent ? (
          <>
            <h1 className="auth-title">Zaloguj się</h1>
            <p className="auth-desc">
              Podaj swój email — wyślemy Ci link do logowania.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="email"
                placeholder="jan@firma.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
                autoFocus
              />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Wysyłanie...' : 'Wyślij link'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-sent">
            <div className="auth-sent-icon">✉️</div>
            <h1 className="auth-title">Sprawdź skrzynkę</h1>
            <p className="auth-desc">
              Wysłaliśmy link do logowania na <strong>{email}</strong>.
              <br />
              Link wygasa za 15 minut.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
