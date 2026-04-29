import { useRef, useState } from 'react';
import { Download, Upload, PlusCircle, UserPlus, RotateCcw, LayoutGrid, Trophy } from 'lucide-react';
import { useMCDA } from '../store';

interface HeaderProps {
  onAddCriterion: () => void;
  onAddSubject: () => void;
  onImport: () => void;
}

export function Header({ onAddCriterion, onAddSubject, onImport }: HeaderProps) {
  const title      = useMCDA((s) => s.project.metadata.title);
  const view       = useMCDA((s) => s.view);
  const criteria   = useMCDA((s) => s.project.criteria);
  const subjects   = useMCDA((s) => s.project.subjects);

  const setTitle      = useMCDA((s) => s.setTitle);
  const setView       = useMCDA((s) => s.setView);
  const exportMarkdown = useMCDA((s) => s.exportMarkdown);
  const resetProject  = useMCDA((s) => s.resetProject);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const hasData = criteria.length > 0 || subjects.length > 0;

  const startEdit = () => {
    setTitleDraft(title);
    setEditingTitle(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const commitTitle = () => {
    if (titleDraft.trim()) setTitle(titleDraft.trim());
    setEditingTitle(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center gap-3">

        {/* Logo */}
        <span className="text-blue-400 font-mono font-bold text-lg shrink-0 select-none">⧖</span>

        {/* Title */}
        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') setEditingTitle(false);
            }}
            className="bg-zinc-800 border border-blue-500 rounded px-2 py-1 text-zinc-100 text-sm font-medium focus:outline-none w-56"
          />
        ) : (
          <button
            onClick={startEdit}
            className="text-zinc-100 font-semibold text-sm truncate hover:text-blue-300 transition-colors cursor-pointer max-w-[220px]"
            title="Click to rename"
          >
            {title}
          </button>
        )}

        <div className="flex-1" />

        {/* View tabs */}
        <div className="flex bg-zinc-900 rounded-lg p-0.5 gap-0.5 shrink-0">
          <button
            onClick={() => setView('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              view === 'matrix'
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutGrid size={13} />
            Matrix
          </button>
          <button
            onClick={() => setView('results')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              view === 'results'
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Trophy size={13} />
            Results
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
            title="Import CSV or Markdown table"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={onAddCriterion}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <PlusCircle size={14} />
            Criterion
          </button>

          <button
            onClick={onAddSubject}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <UserPlus size={14} />
            Subject
          </button>

          <button
            onClick={exportMarkdown}
            disabled={!hasData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Export as Obsidian markdown"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={resetProject}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reset project"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
