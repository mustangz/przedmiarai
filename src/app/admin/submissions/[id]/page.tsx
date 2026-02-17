'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface PrzedmiarRow {
  lp: number;
  opis: string;
  jednostka: string;
  ilosc: number;
  cena_jednostkowa?: number;
  wartosc?: number;
  uwagi?: string;
}

const JEDNOSTKI = [
  'm²', 'm³', 'mb', 'm', 'szt', 'szt.', 'kg', 't',
  'kpl', 'kpl.', 'l', 'godz', 'r-g', 'km', 'dm³',
  'opak', 'ark', 'para', 'elem',
];

interface SubmissionData {
  id: string;
  file_name: string;
  file_url: string;
  status: string;
  ai_result: PrzedmiarRow[] | null;
  final_result: PrzedmiarRow[] | null;
  users: { email: string } | null;
  created_at: string;
}

export default function AdminSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [rows, setRows] = useState<PrzedmiarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  const secret = typeof window !== 'undefined' ? localStorage.getItem('admin_secret') || '' : '';
  const authHeaders = { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        headers: authHeaders,
      });
      if (!res.ok) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setSubmission(data);
      setRows(data.final_result || data.ai_result || []);
    } catch {
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const runAI = async () => {
    if (!submission) return;
    setAiLoading(true);

    try {
      // Update status to processing
      await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: 'processing' }),
      });

      // Call existing analyze-przedmiar endpoint
      const res = await fetch('/api/analyze-przedmiar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: submission.file_url }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiRows = data.rows || data.result || [];
        setRows(aiRows);

        // Save AI result
        await fetch(`/api/admin/submissions/${id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({
            ai_result: aiRows,
            status: 'review',
          }),
        });

        setSubmission((prev) => prev ? { ...prev, status: 'review', ai_result: aiRows } : prev);
      }
    } catch (err) {
      console.error('AI error:', err);
      alert('Błąd AI');
    } finally {
      setAiLoading(false);
    }
  };

  const updateRow = (index: number, field: keyof PrzedmiarRow, value: string | number) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, {
      lp: prev.length + 1,
      opis: '',
      jednostka: 'm²',
      ilosc: 0,
    }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, lp: i + 1 })));
  };

  const approve = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ rows }),
      });

      if (res.ok) {
        alert('Zatwierdzono! Email wysłany do użytkownika.');
        router.push('/admin');
      } else {
        const data = await res.json();
        alert(data.error || 'Błąd');
      }
    } catch {
      alert('Błąd serwera');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return <div className="admin-page"><div className="dash-loading">Ładowanie...</div></div>;
  }

  if (!submission) return null;

  return (
    <div className="admin-page">
      <nav className="dash-nav">
        <button onClick={() => router.push('/admin')} className="admin-back">← Wróć</button>
        <div className="dash-nav-right">
          <span className="dash-email">{submission.users?.email || '—'}</span>
          <span className={`dash-status status-${submission.status}`}>{submission.status}</span>
        </div>
      </nav>

      <div className="admin-detail">
        {/* Left: PDF viewer */}
        <div className="admin-pdf-panel">
          <div className="admin-panel-header">
            <h3>{submission.file_name}</h3>
            <span className="dash-td-date">{new Date(submission.created_at).toLocaleDateString('pl-PL')}</span>
          </div>
          <div className="admin-pdf-viewer">
            {submission.file_url ? (
              <iframe
                src={submission.file_url}
                className="admin-pdf-iframe"
                title="PDF Preview"
              />
            ) : (
              <div className="admin-pdf-placeholder">Brak pliku PDF</div>
            )}
          </div>
        </div>

        {/* Right: Editable table */}
        <div className="admin-table-panel">
          <div className="admin-panel-header">
            <h3>Przedmiar</h3>
            <div className="admin-panel-actions">
              <button
                onClick={runAI}
                disabled={aiLoading}
                className="admin-btn admin-btn-ai"
              >
                {aiLoading ? 'AI pracuje...' : 'Uruchom AI'}
              </button>
              <button onClick={addRow} className="admin-btn admin-btn-add">
                + Dodaj wiersz
              </button>
              <button
                onClick={approve}
                disabled={approving || rows.length === 0}
                className="admin-btn admin-btn-approve"
              >
                {approving ? 'Zatwierdzanie...' : 'Zatwierdź i wyślij'}
              </button>
            </div>
          </div>

          <div className="admin-editable-table-wrap">
            <table className="admin-editable-table">
              <thead>
                <tr>
                  <th>Lp.</th>
                  <th>Opis robót</th>
                  <th>Jedn.</th>
                  <th>Ilość</th>
                  <th>Uwagi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className="admin-td-lp">{row.lp || i + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={row.opis}
                        onChange={(e) => updateRow(i, 'opis', e.target.value)}
                        className="admin-cell-input admin-cell-wide"
                        placeholder="Opis robót..."
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.jednostka}
                        onChange={(e) => updateRow(i, 'jednostka', e.target.value)}
                        className="admin-cell-input admin-cell-sm"
                        placeholder="m²"
                        list="jednostki-list"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.ilosc}
                        onChange={(e) => updateRow(i, 'ilosc', parseFloat(e.target.value) || 0)}
                        className="admin-cell-input admin-cell-num"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.uwagi || ''}
                        onChange={(e) => updateRow(i, 'uwagi', e.target.value)}
                        className="admin-cell-input"
                        placeholder="Uwagi..."
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => removeRow(i)}
                        className="admin-row-delete"
                        title="Usuń wiersz"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="admin-table-empty">
                Kliknij &ldquo;Uruchom AI&rdquo; aby wygenerować tabelę lub dodaj wiersze ręcznie.
              </div>
            )}
            <datalist id="jednostki-list">
              {JEDNOSTKI.map((j) => <option key={j} value={j} />)}
            </datalist>
          </div>
        </div>
      </div>
    </div>
  );
}
