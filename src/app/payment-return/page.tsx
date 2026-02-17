'use client';

import Link from 'next/link';

export default function PaymentReturnPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-sent-icon" style={{ fontSize: 48 }}>🎉</div>
        <h1 className="auth-title">Dziękujemy za zakup!</h1>
        <p className="auth-desc">
          Twoja płatność została odnotowana. Aktywujemy Twoje konto w ciągu kilku godzin
          i wyślemy Ci email z linkiem do logowania.
        </p>
        <Link href="/" className="auth-submit" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', marginTop: '20px' }}>
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}
