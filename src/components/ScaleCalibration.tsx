'use client';

import { useState } from 'react';
import { Ruler, Check, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Ruler className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Kalibracja skali</h3>
            <p className="text-sm text-gray-400">Podaj znany wymiar z rysunku</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Zmierzona długość (piksele)
            </label>
            <input
              type="number"
              value={pixels}
              onChange={(e) => setPixels(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:border-violet-500 focus:outline-none"
              placeholder="np. 200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Narysuj prostokąt o znanej długości i odczytaj piksele
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Rzeczywista długość (metry)
            </label>
            <input
              type="number"
              value={meters}
              onChange={(e) => setMeters(e.target.value)}
              step="0.1"
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:border-violet-500 focus:outline-none"
              placeholder="np. 5"
            />
          </div>

          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <p className="text-sm text-gray-300">
              <strong>Skala:</strong> {scale > 0 ? `${scale.toFixed(1)} px = 1 m` : 'Nie ustawiona'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Anuluj
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
