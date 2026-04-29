import { useRef, useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useMCDA, getCell } from '../store';
import { CELL_COLORS, IMPORTANCE_CONFIG } from '../types';
import type { CellColor, Importance } from '../types';

interface Props {
  onAddCriterion: () => void;
  onAddSubject: () => void;
}

export function MatrixView({ onAddCriterion, onAddSubject }: Props) {
  const criteria           = useMCDA((s) => s.project.criteria);
  const subjects           = useMCDA((s) => s.project.subjects);
  const cells              = useMCDA((s) => s.project.cells);
  const removeCriterion    = useMCDA((s) => s.removeCriterion);
  const removeSubject      = useMCDA((s) => s.removeSubject);
  const setCriterionWinner = useMCDA((s) => s.setCriterionWinner);
  const setCell            = useMCDA((s) => s.setCell);
  const updateImportance   = useMCDA((s) => s.updateCriterionImportance);

  if (criteria.length === 0 && subjects.length === 0) {
    return <EmptyState onAddCriterion={onAddCriterion} onAddSubject={onAddSubject} />;
  }

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {/* Criterion name */}
              <th className="sticky left-0 z-20 bg-zinc-950 text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider min-w-[200px]">
                Criterion
              </th>
              {/* Importance */}
              <th className="px-3 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider w-20">
                Priority
              </th>
              {/* Subject columns */}
              {subjects.map((subject) => (
                <th key={subject.id} className="px-4 py-3 text-center min-w-[160px]">
                  <div className="flex items-center justify-center gap-1.5 group">
                    <span className="text-zinc-100 font-medium text-sm">{subject.name}</span>
                    <button
                      onClick={() => removeSubject(subject.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {subject.description && (
                    <div className="text-zinc-600 text-[11px] font-normal mt-0.5">{subject.description}</div>
                  )}
                </th>
              ))}
              {/* Winner column header */}
              {criteria.length > 0 && subjects.length > 0 && (
                <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider w-36">
                  Winner
                </th>
              )}
              {/* Add subject */}
              <th className="px-3 py-3 w-12">
                <button
                  onClick={onAddSubject}
                  className="text-zinc-600 hover:text-blue-400 transition-colors cursor-pointer p-1 rounded hover:bg-zinc-800"
                  title="Add subject"
                >
                  <Plus size={16} />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {criteria.map((criterion) => (
              <tr
                key={criterion.id}
                className="border-b border-zinc-800/60 hover:bg-zinc-900/20 transition-colors group/row"
              >
                {/* Criterion name — sticky */}
                <td className="sticky left-0 z-10 bg-zinc-950 group-hover/row:bg-[#0f0f10] px-4 py-2.5 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-100 font-medium truncate">{criterion.name}</span>
                    <button
                      onClick={() => removeCriterion(criterion.id)}
                      className="ml-auto shrink-0 text-zinc-700 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover/row:opacity-100"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </td>

                {/* Importance badge — clickable cycle */}
                <td className="px-3 py-2.5 text-center">
                  <button
                    onClick={() => {
                      const order: Importance[] = ['high', 'medium', 'low'];
                      const next = order[(order.indexOf(criterion.importance) + 1) % order.length];
                      updateImportance(criterion.id, next);
                    }}
                    className={`text-[10px] font-semibold px-2 py-1 rounded border cursor-pointer transition-colors ${IMPORTANCE_CONFIG[criterion.importance].className}`}
                    title="Click to cycle importance"
                  >
                    {IMPORTANCE_CONFIG[criterion.importance].label}
                  </button>
                </td>

                {/* Score cells */}
                {subjects.map((subject) => {
                  const cell = getCell(cells, subject.id, criterion.id);
                  return (
                    <td key={subject.id} className="px-2 py-1.5">
                      <CellEditor
                        text={cell?.text ?? ''}
                        color={cell?.color ?? null}
                        onChange={(text, color) => setCell(subject.id, criterion.id, text, color)}
                      />
                    </td>
                  );
                })}

                {/* Winner selector */}
                {subjects.length > 0 && (
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {subjects.map((subject) => {
                        const isWinner = criterion.winner_subject_id === subject.id;
                        return (
                          <button
                            key={subject.id}
                            onClick={() =>
                              setCriterionWinner(criterion.id, isWinner ? null : subject.id)
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                              isWinner
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-zinc-800/60 text-zinc-500 border-zinc-700/50 hover:text-zinc-300 hover:border-zinc-500'
                            }`}
                            title={isWinner ? 'Clear winner' : `Set ${subject.name} as winner`}
                          >
                            {isWinner && <Check size={9} className="inline mr-0.5 -mt-px" />}
                            {subject.name}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add criterion footer */}
      <div className="border-t border-zinc-800 px-4 py-2.5">
        <button
          onClick={onAddCriterion}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer py-0.5"
        >
          <Plus size={14} />
          Add Criterion
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CellEditor
// ---------------------------------------------------------------------------

interface CellEditorProps {
  text: string;
  color: CellColor;
  onChange: (text: string, color: CellColor) => void;
}

function CellEditor({ text, color, onChange }: CellEditorProps) {
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState('');
  const [draftColor, setDraftColor] = useState<CellColor>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setDraft(text);
    setDraftColor(color);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    onChange(draft.trim(), draftColor);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="rounded-lg border border-blue-500 bg-zinc-800 p-2 min-w-[140px]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => {
            // only commit if focus left the entire editor div
            if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
              commit();
            }
          }}
          className="w-full bg-transparent text-zinc-100 text-sm focus:outline-none placeholder:text-zinc-600"
          placeholder="Enter value…"
        />
        {/* Color swatches */}
        <div className="flex items-center gap-1.5 mt-2">
          {/* "No color" option */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setDraftColor(null)}
            className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
              draftColor === null
                ? 'border-blue-400 bg-zinc-600 scale-110'
                : 'border-zinc-600 bg-zinc-700 hover:border-zinc-400'
            }`}
            title="No color"
          />
          {(Object.entries(CELL_COLORS) as [keyof typeof CELL_COLORS, { hex: string; label: string }][]).map(
            ([key, { hex, label }]) => (
              <button
                key={key}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setDraftColor(key)}
                className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                  draftColor === key ? 'border-white scale-125' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: hex }}
                title={label}
              />
            ),
          )}
        </div>
      </div>
    );
  }

  // View mode
  const colorHex = color ? CELL_COLORS[color].hex : null;
  return (
    <button
      onClick={open}
      className="w-full min-h-[36px] text-left px-2.5 py-1.5 rounded-lg border border-transparent hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors cursor-pointer group flex items-start gap-2 min-w-[140px]"
      title="Click to edit"
    >
      {colorHex && (
        <span
          className="mt-1 w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: colorHex }}
        />
      )}
      <span
        className={`text-sm leading-snug ${
          text
            ? 'text-zinc-200'
            : 'text-zinc-700 group-hover:text-zinc-500 italic'
        }`}
      >
        {text || 'add value'}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onAddCriterion, onAddSubject }: { onAddCriterion: () => void; onAddSubject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
      <div className="text-zinc-700 text-6xl font-mono select-none">⧖</div>
      <div>
        <h2 className="text-zinc-300 font-semibold text-lg mb-2">Start a comparison</h2>
        <p className="text-zinc-600 text-sm max-w-xs">
          Add criteria (what you're evaluating) and subjects (the options). Or import a CSV / Markdown table.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAddCriterion}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Criterion
        </button>
        <button
          onClick={onAddSubject}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>
    </div>
  );
}
