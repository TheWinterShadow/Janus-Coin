import { useState } from 'react';
import { X } from 'lucide-react';
import { useMCDA } from '../store';

interface Props { onClose: () => void }

export function AddSubjectModal({ onClose }: Props) {
  const addSubject = useMCDA((s) => s.addSubject);

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');

  const canSubmit = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addSubject({ name: name.trim(), description: description.trim() });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-zinc-100 font-semibold text-base">Add Subject</h2>
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
              placeholder="e.g. Option A, LangChain, Vendor X"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">
              Description <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 transition-colors"
            />
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
