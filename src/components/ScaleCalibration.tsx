'use client';

import { useState } from 'react';

// ─── Inline SVG icons ─────────────────────────────────────────
const Icons = {
  Ruler: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" />
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
  scale: number; // pixels per meter
  onScaleChange: (scale: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScaleCalibration({ scale, onScaleChange, isOpen, onClose }: Props) {
  const [pixels, setPixels] = useState('100');
  const [meters, setMeters] = useState('1');

  if (!isOpen) return null;

  const handleSave = () => {
    const pxValue = parseFloat(pixels);
    const mValue = parseFloat(meters);

    if (pxValue > 0 && mValue > 0) {
      onScaleChange(pxValue / mValue);
      onClose();
    }
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal">
        <div className="app-modal-header">
          <div className="app-modal-icon">
            <Icons.Ruler />
          </div>
          <div>
            <div className="app-modal-title">Kalibracja skali</div>
            <div className="app-modal-subtitle">Podaj znany wymiar z rysunku</div>
          </div>
        </div>

        <div className="app-modal-fields">
          <div>
            <label className="app-modal-label">
              Zmierzona długość (piksele)
            </label>
            <input
              type="number"
              value={pixels}
              onChange={(e) => setPixels(e.target.value)}
              className="app-modal-input"
              placeholder="np. 200"
            />
            <p className="app-modal-hint">
              Narysuj prostokąt o znanej długości i odczytaj piksele
            </p>
          </div>

          <div>
            <label className="app-modal-label">
              Rzeczywista długość (metry)
            </label>
            <input
              type="number"
              value={meters}
              onChange={(e) => setMeters(e.target.value)}
              step="0.1"
              className="app-modal-input"
              placeholder="np. 5"
            />
          </div>

          <div className="app-modal-scale-info">
            <strong>Skala:</strong> {scale > 0 ? `${scale.toFixed(1)} px = 1 m` : 'Nie ustawiona'}
          </div>
        </div>

        <div className="app-modal-buttons">
          <button
            type="button"
            onClick={onClose}
            className="panel-action-btn"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Icons.X />
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="panel-action-btn primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Icons.Check />
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
