import { useState } from 'react';
import { X } from 'lucide-react';
import { useMCDA } from '../store';
import { IMPORTANCE_CONFIG } from '../types';
import type { Importance } from '../types';

interface Props { onClose: () => void }

export function AddCriterionModal({ onClose }: Props) {
  const addCriterion = useMCDA((s) => s.addCriterion);

  const [name, setName]             = useState('');
  const [importance, setImportance] = useState<Importance>('medium');

  const canSubmit = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addCriterion({ name: name.trim(), importance, winner_subject_id: null });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-zinc-100 font-semibold text-base">Add Criterion</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Performance, License, UX Quality"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Importance</label>
            <div className="flex gap-2">
              {(Object.keys(IMPORTANCE_CONFIG) as Importance[]).map((imp) => {
                const cfg = IMPORTANCE_CONFIG[imp];
                return (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => setImportance(imp)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      importance === imp
                        ? cfg.className
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
