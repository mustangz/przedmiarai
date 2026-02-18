'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect');
    if (!token) {
      setStatus('error');
      setErrorMsg('Brak tokenu w linku.');
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Błąd weryfikacji');
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(redirect || '/dashboard');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message);
      });
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-sent-icon">❌</div>
          <h1 className="auth-title">Błąd logowania</h1>
          <p className="auth-desc">{errorMsg}</p>
          <a href="/login" className="auth-submit" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', marginTop: '20px' }}>
            Spróbuj ponownie
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Logowanie...</h1>
        <p className="auth-desc">Weryfikujemy Twój link.</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Ładowanie...</h1>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
