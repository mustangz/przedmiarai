'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  users: { email: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Oczekuje', cls: 'status-pending' },
  processing: { label: 'Przetwarzanie', cls: 'status-processing' },
  review: { label: 'Weryfikacja', cls: 'status-review' },
  done: { label: 'Gotowe', cls: 'status-done' },
  error: { label: 'Błąd', cls: 'status-error' },
};

const FILTERS = ['all', 'pending', 'processing', 'review', 'done', 'error'];

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_secret');
    if (saved) {
      setSecret(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchSubmissions();
  }, [authed, filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${filter}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) {
        setAuthed(false);
        localStorage.removeItem('admin_secret');
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin_secret', secret);
    setAuthed(true);
  };

  if (!authed) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Admin Panel</h1>
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="auth-input"
              autoFocus
            />
            <button type="submit" className="auth-submit">Zaloguj</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <nav className="dash-nav">
        <div className="dash-logo-text" style={{ fontWeight: 700, fontSize: 17 }}>Admin Panel</div>
        <button onClick={() => { localStorage.removeItem('admin_secret'); setAuthed(false); }} className="dash-logout">
          Wyloguj
        </button>
      </nav>

      <div className="admin-content">
        {/* Filters */}
        <div className="admin-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`admin-filter ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Wszystkie' : STATUS_LABELS[f]?.label || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="dash-loading">Ładowanie...</div>
        ) : submissions.length === 0 ? (
          <div className="dash-empty"><p>Brak zgłoszeń.</p></div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table admin-table">
              <thead>
                <tr>
                  <th>Plik</th>
                  <th>Użytkownik</th>
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
                      <td>{s.users?.email || '—'}</td>
                      <td><span className={`dash-status ${st.cls}`}>{st.label}</span></td>
                      <td className="dash-td-date">{new Date(s.created_at).toLocaleDateString('pl-PL')}</td>
                      <td>
                        <Link href={`/admin/submissions/${s.id}`} className="admin-action-link">
                          Otwórz
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
