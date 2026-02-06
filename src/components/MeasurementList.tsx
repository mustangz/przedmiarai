'use client';

import { useState } from 'react';
import type { Measurement } from './MeasurementCanvas';

// ─── Inline SVG icons ─────────────────────────────────────────
const Icons = {
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Ruler: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
};

interface Props {
  measurements: Measurement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
}

export default function MeasurementList({ measurements, selectedId, onSelect, onDelete, onRename, hoveredId, onHover }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const totalArea = measurements.reduce((sum, m) => sum + m.areaM2, 0);

  const startEdit = (m: Measurement) => {
    setEditingId(m.id);
    setEditName(m.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  if (measurements.length === 0) {
    return (
      <div className="app-measurement-empty">
        <Icons.Ruler />
        <p className="app-measurement-empty-title">Brak pomiarów</p>
        <p className="app-measurement-empty-hint">Wybierz narzędzie &quot;Mierz&quot; i zaznacz obszar</p>
      </div>
    );
  }

  return (
    <>
      <div className="app-measurement-list">
        {measurements.map((m) => (
          <div
            key={m.id}
            onClick={() => onSelect(m.id)}
            onMouseEnter={() => onHover?.(m.id)}
            onMouseLeave={() => onHover?.(null)}
            className={`app-measurement-card ${selectedId === m.id ? 'selected' : ''} ${hoveredId === m.id ? 'hovered' : ''}`}
          >
            <div className="app-measurement-header">
              {editingId === m.id ? (
                <div className="app-measurement-edit-row">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="app-measurement-edit-input"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                    className="app-ai-room-btn approve"
                  >
                    <Icons.Check />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                    className="app-ai-room-btn reject"
                  >
                    <Icons.X />
                  </button>
                </div>
              ) : (
                <>
                  <span className="app-measurement-name">{m.name}</span>
                  <div className="app-measurement-actions">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startEdit(m); }}
                      className="app-measurement-action-btn"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
                      className="app-measurement-action-btn delete"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="app-measurement-area">
              {m.areaM2.toFixed(2)} m²
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="app-total-area">
        <div className="app-total-label">Suma powierzchni</div>
        <div className="app-total-value">{totalArea.toFixed(2)} m²</div>
      </div>
    </>
  );
}
