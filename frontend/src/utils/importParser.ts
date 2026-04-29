import type { CellColor, CellValue, Criterion, Importance, Subject } from '../types';

export interface ParsedImport {
  ok: true;
  subjects: Omit<Subject, 'id'>[];
  criteria: Omit<Criterion, 'id'>[];
  // cells[criterionIndex][subjectIndex]
  cells: { text: string; color: CellColor }[][];
}

export interface ParseError {
  ok: false;
  error: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseImport(raw: string): ParsedImport | ParseError {
  const lines = raw
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return { ok: false, error: 'Need at least a header row and one data row.' };

  const isMd = lines[0].startsWith('|');

  const headers = isMd ? parseMdRow(lines[0]) : parseCsvLine(lines[0]);
  if (headers.length < 2) return { ok: false, error: 'Could not parse column headers.' };

  // Detect optional "Importance" column in position 1
  const hasImportance = headers[1].toLowerCase().startsWith('import');
  const subjectStart = hasImportance ? 2 : 1;
  const subjectNames = headers.slice(subjectStart);
  if (subjectNames.length === 0) return { ok: false, error: 'No subject columns found after criterion column.' };

  const subjects: Omit<Subject, 'id'>[] = subjectNames.map((name) => ({
    name,
    description: '',
  }));

  // Skip MD separator row
  const dataLines = isMd ? lines.slice(2) : lines.slice(1);

  const criteria: Omit<Criterion, 'id'>[] = [];
  const cells: { text: string; color: CellColor }[][] = [];

  for (const line of dataLines) {
    const cols = isMd ? parseMdRow(line) : parseCsvLine(line);
    if (!cols[0]) continue;

    criteria.push({
      name: cols[0],
      importance: hasImportance ? toImportance(cols[1] ?? '') : 'medium',
      winner_subject_id: null,
    });

    cells.push(
      subjectNames.map((_, i) => ({
        text: cols[subjectStart + i] ?? '',
        color: null satisfies CellColor,
      })),
    );
  }

  if (criteria.length === 0) return { ok: false, error: 'No data rows found.' };

  return { ok: true, subjects, criteria, cells };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toImportance(val: string): Importance {
  const v = val.trim().toLowerCase();
  if (v === 'high' || v === 'h') return 'high';
  if (v === 'low'  || v === 'l') return 'low';
  return 'medium';
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseMdRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map((s) => s.trim());
}

// ---------------------------------------------------------------------------
// Merge helper used by the store
// ---------------------------------------------------------------------------

export function buildCellValues(
  parsedCriteria: Omit<Criterion, 'id'>[],
  criteriaIds: string[],
  parsedSubjects: Omit<Subject, 'id'>[],
  subjectIds: string[],
  cellGrid: { text: string; color: CellColor }[][],
): CellValue[] {
  const result: CellValue[] = [];
  for (let ci = 0; ci < parsedCriteria.length; ci++) {
    for (let si = 0; si < parsedSubjects.length; si++) {
      const text = cellGrid[ci]?.[si]?.text ?? '';
      if (text) {
        result.push({
          criterion_id: criteriaIds[ci],
          subject_id:   subjectIds[si],
          text,
          color: cellGrid[ci]?.[si]?.color ?? null,
        });
      }
    }
  }
  return result;
}
