'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  plan: string;
  credits_remaining: number;
}

interface Submission {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  excel_url: string | null;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Oczekuje', cls: 'status-pending' },
  processing: { label: 'Przetwarzanie', cls: 'status-processing' },
  review: { label: 'Weryfikacja', cls: 'status-review' },
  done: { label: 'Gotowe', cls: 'status-done' },
  error: { label: 'Błąd', cls: 'status-error' },
};

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [userRes, subsRes] = await Promise.all([
        fetch('/api/user/me', { headers: authHeaders() }),
        fetch('/api/user/submissions', { headers: authHeaders() }),
      ]);

      if (!userRes.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      const userData = await userRes.json();
      const subsData = await subsRes.json();
      setUser(userData);
      setSubmissions(subsData.submissions || []);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/submissions/create', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Błąd uploadu');
        return;
      }

      await fetchData();
    } catch {
      alert('Błąd uploadu');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-loading">Ładowanie...</div>
      </div>
    );
  }

  const planLabel = user?.plan === 'free' ? 'Darmowy' : user?.plan?.charAt(0).toUpperCase() + (user?.plan?.slice(1) || '');

  return (
    <div className="dash-page">
      {/* Nav */}
      <nav className="dash-nav">
        <Link href="/" className="logo">
          <div className="logo-icon-sm" />
          <span className="dash-logo-text">PrzedmiarAI</span>
        </Link>
        <div className="dash-nav-right">
          <span className="dash-email">{user?.email}</span>
          <button onClick={handleLogout} className="dash-logout">Wyloguj</button>
        </div>
      </nav>

      <div className="dash-content">
        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-value">{planLabel}</span>
            <span className="dash-stat-label">Plan</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">
              {user?.plan === 'firma' ? '∞' : user?.credits_remaining}
            </span>
            <span className="dash-stat-label">Pozostałe analizy</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{submissions.length}</span>
            <span className="dash-stat-label">Wszystkie analizy</span>
          </div>
        </div>

        {/* Upload */}
        <div
          className={`dash-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <p className="dash-dropzone-text">Wysyłanie pliku...</p>
          ) : (
            <>
              <p className="dash-dropzone-text">
                Przeciągnij plik PDF tutaj lub{' '}
                <label className="dash-dropzone-link">
                  wybierz z dysku
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </label>
              </p>
              <p className="dash-dropzone-hint">Obsługujemy pliki PDF z przedmiarami robót</p>
            </>
          )}
        </div>

        {/* Submissions */}
        <h2 className="dash-section-title">Historia analiz</h2>
        {submissions.length === 0 ? (
          <div className="dash-empty">
            <p>Nie masz jeszcze żadnych analiz. Wgraj swój pierwszy plik PDF powyżej.</p>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Plik</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Akcja</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const st = STATUS_LABELS[s.status] || { label: s.status, cls: '' };
                  return (
                    <tr key={s.id}>
                      <td className="dash-td-file">{s.file_name}</td>
                      <td>
                        <span className={`dash-status ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="dash-td-date">
                        {new Date(s.created_at).toLocaleDateString('pl-PL')}
                      </td>
                      <td>
                        {s.status === 'done' && s.excel_url ? (
                          <a href={s.excel_url} className="dash-download" download>
                            Pobierz Excel
                          </a>
                        ) : (
                          <span className="dash-td-wait">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Upgrade CTA */}
        {user?.plan === 'free' && (
          <div className="dash-upgrade">
            <p>Potrzebujesz więcej analiz?</p>
            <Link href="/#cennik" className="dash-upgrade-link">Zobacz plany →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
