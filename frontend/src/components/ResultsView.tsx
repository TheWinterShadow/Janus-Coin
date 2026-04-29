import { Trophy } from 'lucide-react';
import { useMCDA } from '../store';
import { IMPORTANCE_CONFIG, CELL_COLORS } from '../types';
import type { Importance } from '../types';

const IMP_ORDER: Importance[] = ['high', 'medium', 'low'];

export function ResultsView() {
  const criteria      = useMCDA((s) => s.project.criteria);
  const subjects      = useMCDA((s) => s.project.subjects);
  const cells         = useMCDA((s) => s.project.cells);
  const notes         = useMCDA((s) => s.project.metadata.notes);
  const finalWinnerId = useMCDA((s) => s.project.metadata.final_winner_id);
  const setFinalWinner = useMCDA((s) => s.setFinalWinner);
  const setNotes      = useMCDA((s) => s.setNotes);

  const cellIndex = new Map(cells.map((c) => [`${c.subject_id}:${c.criterion_id}`, c]));

  const finalWinner = subjects.find((s) => s.id === finalWinnerId);

  // Win tally per subject
  const tally = subjects.map((s) => ({
    subject: s,
    high:   criteria.filter((c) => c.importance === 'high'   && c.winner_subject_id === s.id).length,
    medium: criteria.filter((c) => c.importance === 'medium' && c.winner_subject_id === s.id).length,
    low:    criteria.filter((c) => c.importance === 'low'    && c.winner_subject_id === s.id).length,
    total:  criteria.filter((c) => c.winner_subject_id === s.id).length,
  })).sort((a, b) => b.high - a.high || b.medium - a.medium || b.total - a.total);

  if (subjects.length === 0) {
    return (
      <div className="flex items-center justify-center py-32 text-zinc-600 text-sm">
        No data yet — add subjects and criteria in the Matrix view.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Final winner declaration */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy size={13} className="text-amber-400" />
          Declare Final Winner
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.map((s) => {
            const isSelected = finalWinnerId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setFinalWinner(isSelected ? null : s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {finalWinner ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40">
            <Trophy size={20} className="text-amber-400 shrink-0" />
            <div>
              <div className="text-amber-300 font-bold text-base">{finalWinner.name}</div>
              <div className="text-amber-700 text-xs mt-0.5">Declared winner</div>
            </div>
          </div>
        ) : (
          <div className="text-zinc-600 text-sm italic">No winner declared yet.</div>
        )}
      </div>

      {/* Criteria win tally */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Criteria Wins by Priority
          </h3>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-2.5 text-xs text-zinc-500 font-medium">Subject</th>
              {IMP_ORDER.map((imp) => (
                <th key={imp} className="px-4 py-2.5 text-center text-xs font-medium">
                  <span className={`px-2 py-0.5 rounded border text-[10px] ${IMPORTANCE_CONFIG[imp].className}`}>
                    {IMPORTANCE_CONFIG[imp].label}
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 text-center text-xs text-zinc-500 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {tally.map(({ subject, high, medium, low, total }, i) => {
              const isFinal = subject.id === finalWinnerId;
              return (
                <tr
                  key={subject.id}
                  className={`border-b border-zinc-800/50 ${isFinal ? 'bg-amber-950/10' : i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}
                >
                  <td className="px-5 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {isFinal && <Trophy size={13} className="text-amber-400 shrink-0" />}
                      <span className={isFinal ? 'text-amber-300' : 'text-zinc-200'}>{subject.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <WinCount count={high} color="text-amber-400" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <WinCount count={medium} color="text-blue-400" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <WinCount count={low} color="text-zinc-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono font-semibold text-zinc-300">{total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Criteria breakdown by importance */}
      {IMP_ORDER.map((imp) => {
        const group = criteria.filter((c) => c.importance === imp);
        if (group.length === 0) return null;
        return (
          <div key={imp} className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${IMPORTANCE_CONFIG[imp].className}`}>
                {IMPORTANCE_CONFIG[imp].label}
              </span>
              <span className="text-zinc-500 text-xs">{group.length} criterion{group.length !== 1 ? 'a' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="sticky left-0 bg-zinc-950 text-left px-5 py-2 text-xs text-zinc-500 font-medium min-w-[180px]">
                      Criterion
                    </th>
                    {subjects.map((s) => (
                      <th key={s.id} className="px-4 py-2 text-center text-xs text-zinc-400 font-medium min-w-[150px]">
                        {s.name}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center text-xs text-zinc-500 font-medium w-32">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((criterion) => {
                    const winner = subjects.find((s) => s.id === criterion.winner_subject_id);
                    return (
                      <tr key={criterion.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/20 transition-colors">
                        <td className="sticky left-0 bg-zinc-950 px-5 py-2.5 text-zinc-300 font-medium">
                          {criterion.name}
                        </td>
                        {subjects.map((s) => {
                          const cell = cellIndex.get(`${s.id}:${criterion.id}`);
                          const isWinner = criterion.winner_subject_id === s.id;
                          const colorHex = cell?.color ? CELL_COLORS[cell.color].hex : null;
                          return (
                            <td
                              key={s.id}
                              className={`px-4 py-2.5 text-center ${isWinner ? 'bg-amber-950/10' : ''}`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                {colorHex && (
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
                                )}
                                <span className={`text-sm ${cell?.text ? (isWinner ? 'text-amber-300 font-medium' : 'text-zinc-300') : 'text-zinc-700 italic'}`}>
                                  {cell?.text || '—'}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-2.5 text-center">
                          {winner ? (
                            <span className="text-amber-400 text-xs font-medium">{winner.name}</span>
                          ) : (
                            <span className="text-zinc-700 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Notes */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Notes
          <span className="text-zinc-600 normal-case font-normal ml-2">appended to markdown export</span>
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Decision rationale, caveats, context…"
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 resize-y transition-colors leading-relaxed"
        />
      </div>
    </div>
  );
}

function WinCount({ count, color }: { count: number; color: string }) {
  if (count === 0) return <span className="text-zinc-700 font-mono">—</span>;
  return <span className={`font-mono font-semibold ${color}`}>{count}</span>;
}
