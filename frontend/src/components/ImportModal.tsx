import { useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useMCDA } from '../store';
import { parseImport } from '../utils/importParser';
import type { ParsedImport } from '../utils/importParser';

const EXAMPLE_CSV = `Criterion,Importance,Option A,Option B,Option C
Performance,High,Fast,Medium,Slow
Documentation,High,Excellent,Good,Poor
License,Medium,MIT,Apache,GPL
Price,Medium,$99/mo,$149/mo,$49/mo
Community,Low,Large,Medium,Small`;

const EXAMPLE_MD = `| Criterion | Importance | Option A | Option B | Option C |
| --- | --- | --- | --- | --- |
| Performance | High | Fast | Medium | Slow |
| Documentation | High | Excellent | Good | Poor |
| License | Medium | MIT | Apache | GPL |`;

interface Props { onClose: () => void }

export function ImportModal({ onClose }: Props) {
  const importData = useMCDA((s) => s.importData);

  const [raw, setRaw]             = useState('');
  const [parsed, setParsed]       = useState<ParsedImport | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tryParse = (text: string) => {
    const result = parseImport(text);
    if (!result.ok) {
      setParseError(result.error);
      setParsed(null);
    } else {
      setParseError(null);
      setParsed(result);
    }
  };

  const handleTextChange = (val: string) => {
    setRaw(val);
    if (val.trim()) tryParse(val);
    else { setParsed(null); setParseError(null); }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRaw(text);
      tryParse(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (!parsed) return;
    importData(parsed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-zinc-100 font-semibold text-base">Import Data</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Paste a CSV or Markdown table, or drop a file</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Format hint */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-zinc-800 p-3">
              <div className="text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                <FileText size={12} /> CSV format
              </div>
              <pre className="text-zinc-600 font-mono text-[10px] leading-relaxed overflow-x-auto">{`Criterion,Importance,SubjectA,...\nPerformance,High,Fast,...`}</pre>
              <button
                onClick={() => handleTextChange(EXAMPLE_CSV)}
                className="mt-2 text-blue-500 hover:text-blue-400 text-[10px] cursor-pointer transition-colors"
              >
                Load example
              </button>
            </div>
            <div className="rounded-lg border border-zinc-800 p-3">
              <div className="text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
                <FileText size={12} /> Markdown table
              </div>
              <pre className="text-zinc-600 font-mono text-[10px] leading-relaxed overflow-x-auto">{`| Criterion | Importance | SubjectA |...\n| --- | --- | --- |...\n| Performance | High | Fast |...`}</pre>
              <button
                onClick={() => handleTextChange(EXAMPLE_MD)}
                className="mt-2 text-blue-500 hover:text-blue-400 text-[10px] cursor-pointer transition-colors"
              >
                Load example
              </button>
            </div>
          </div>

          {/* Drop zone / textarea */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors"
          >
            <textarea
              value={raw}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste CSV or Markdown table here, or drag & drop a .csv / .md file…"
              rows={9}
              className="w-full bg-transparent px-4 py-3 text-zinc-300 text-xs font-mono focus:outline-none placeholder:text-zinc-600 resize-none"
              spellCheck={false}
            />
          </div>

          {/* File picker */}
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.md,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <Upload size={13} />
              Browse file
            </button>
            {raw && (
              <button
                onClick={() => { setRaw(''); setParsed(null); setParseError(null); }}
                className="text-zinc-600 hover:text-zinc-400 text-xs cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Parse feedback */}
          {parseError && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2.5">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}
          {parsed && !parseError && (
            <div className="rounded-lg border border-green-900/40 bg-green-950/20 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                <CheckCircle size={13} />
                Ready to import
              </div>
              <div className="flex gap-4 text-xs text-zinc-400">
                <span><span className="text-zinc-200 font-mono">{parsed.subjects.length}</span> subjects</span>
                <span><span className="text-zinc-200 font-mono">{parsed.criteria.length}</span> criteria</span>
                <span>
                  <span className="text-zinc-200 font-mono">
                    {parsed.cells.flat().filter((c) => c.text).length}
                  </span> non-empty cells
                </span>
              </div>
              {/* Preview table */}
              <div className="overflow-x-auto mt-2 rounded border border-zinc-800">
                <table className="text-[11px] border-collapse w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-2.5 py-1.5 text-zinc-500 font-medium">Criterion</th>
                      <th className="px-2.5 py-1.5 text-zinc-500 font-medium">Priority</th>
                      {parsed.subjects.map((s) => (
                        <th key={s.name} className="px-2.5 py-1.5 text-zinc-400 font-medium">{s.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.criteria.slice(0, 5).map((c, ci) => (
                      <tr key={ci} className="border-b border-zinc-800/50">
                        <td className="px-2.5 py-1.5 text-zinc-300">{c.name}</td>
                        <td className="px-2.5 py-1.5 text-center text-zinc-500 capitalize">{c.importance}</td>
                        {parsed.cells[ci]?.map((cell, si) => (
                          <td key={si} className="px-2.5 py-1.5 text-zinc-400 text-center">{cell.text || '—'}</td>
                        ))}
                      </tr>
                    ))}
                    {parsed.criteria.length > 5 && (
                      <tr>
                        <td colSpan={2 + parsed.subjects.length} className="px-2.5 py-1.5 text-zinc-600 italic text-center">
                          +{parsed.criteria.length - 5} more rows…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!parsed}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Import{parsed ? ` ${parsed.criteria.length} rows` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
