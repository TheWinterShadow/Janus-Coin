export type Importance = 'high' | 'medium' | 'low';

export const IMPORTANCE_CONFIG: Record<Importance, { label: string; className: string }> = {
  high:   { label: 'HIGH', className: 'bg-amber-950/60 text-amber-400 border-amber-900/50' },
  medium: { label: 'MED',  className: 'bg-blue-950/60 text-blue-400 border-blue-900/50' },
  low:    { label: 'LOW',  className: 'bg-zinc-800 text-zinc-500 border-zinc-700/50' },
};

export const CELL_COLORS = {
  green:  { hex: '#22c55e', label: 'Positive' },
  blue:   { hex: '#3b82f6', label: 'Neutral'  },
  amber:  { hex: '#f59e0b', label: 'Caution'  },
  red:    { hex: '#ef4444', label: 'Negative' },
  purple: { hex: '#a855f7', label: 'Notable'  },
  pink:   { hex: '#ec4899', label: 'Alt'      },
} as const;

export type CellColor = keyof typeof CELL_COLORS | null;

export interface ProjectMetadata {
  title: string;
  tags: string[];
  created_date: string; // ISO date YYYY-MM-DD
  notes: string;
  final_winner_id: string | null;
}

export interface Criterion {
  id: string;
  name: string;
  importance: Importance;
  winner_subject_id: string | null;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface CellValue {
  subject_id: string;
  criterion_id: string;
  text: string;
  color: CellColor;
}

export interface ComparisonProject {
  metadata: ProjectMetadata;
  criteria: Criterion[];
  subjects: Subject[];
  cells: CellValue[];
}
