'use client';

import { Trash2, Ruler, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import type { Measurement } from './MeasurementCanvas';

interface Props {
  measurements: Measurement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export default function MeasurementList({ measurements, selectedId, onSelect, onDelete, onRename }: Props) {
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
      <div className="text-center text-gray-500 py-8">
        <Ruler className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Brak pomiarów</p>
        <p className="text-xs mt-1">Wybierz narzędzie &quot;Mierz&quot; i zaznacz obszar</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 mb-6">
        {measurements.map((m) => (
          <div
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              selectedId === m.id
                ? 'bg-violet-500/20 border border-violet-500'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-violet-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              {editingId === m.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 px-2 py-1 bg-[var(--background)] border border-[var(--card-border)] rounded text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                    className="p-1 hover:bg-emerald-500/20 rounded transition"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                    className="p-1 hover:bg-red-500/20 rounded transition"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{m.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(m); }}
                      className="p-1 hover:bg-violet-500/20 rounded transition"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
                      className="p-1 hover:bg-red-500/20 rounded transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="text-lg font-bold text-violet-400">
              {m.areaM2.toFixed(2)} m²
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
        <div className="text-sm text-gray-400 mb-1">Suma powierzchni</div>
        <div className="text-2xl font-bold gradient-text">{totalArea.toFixed(2)} m²</div>
      </div>
    </>
  );
}
