import { create } from 'zustand';
import { downloadMarkdown } from './utils/markdownExport';
import { buildCellValues } from './utils/importParser';
import type { ParsedImport } from './utils/importParser';
import type {
  CellColor,
  CellValue,
  ComparisonProject,
  Criterion,
  Importance,
  Subject,
} from './types';

const today = () => new Date().toISOString().slice(0, 10);

const defaultProject: ComparisonProject = {
  metadata: {
    title: 'Untitled Comparison',
    tags: ['comparison'],
    created_date: today(),
    notes: '',
    final_winner_id: null,
  },
  criteria: [],
  subjects: [],
  cells: [],
};

export type View = 'matrix' | 'results';

interface MCDAState {
  project: ComparisonProject;
  view: View;
  error: string | null;
}

interface MCDAActions {
  setTitle: (title: string) => void;
  setNotes: (notes: string) => void;
  setFinalWinner: (subjectId: string | null) => void;

  addCriterion: (c: Omit<Criterion, 'id'>) => void;
  updateCriterionImportance: (id: string, importance: Importance) => void;
  setCriterionWinner: (criterionId: string, subjectId: string | null) => void;
  removeCriterion: (id: string) => void;

  addSubject: (s: Omit<Subject, 'id'>) => void;
  removeSubject: (id: string) => void;

  setCell: (subjectId: string, criterionId: string, text: string, color: CellColor) => void;

  importData: (parsed: ParsedImport) => void;
  exportMarkdown: () => void;

  setView: (view: View) => void;
  clearError: () => void;
  resetProject: () => void;
}

export const useMCDA = create<MCDAState & MCDAActions>((set, get) => ({
  project: defaultProject,
  view: 'matrix',
  error: null,

  setTitle: (title) =>
    set((s) => ({ project: { ...s.project, metadata: { ...s.project.metadata, title } } })),

  setNotes: (notes) =>
    set((s) => ({ project: { ...s.project, metadata: { ...s.project.metadata, notes } } })),

  setFinalWinner: (subjectId) =>
    set((s) => ({
      project: {
        ...s.project,
        metadata: { ...s.project.metadata, final_winner_id: subjectId },
      },
    })),

  addCriterion: (c) =>
    set((s) => ({
      project: {
        ...s.project,
        criteria: [...s.project.criteria, { ...c, id: crypto.randomUUID() }],
      },
    })),

  updateCriterionImportance: (id, importance) =>
    set((s) => ({
      project: {
        ...s.project,
        criteria: s.project.criteria.map((c) => (c.id === id ? { ...c, importance } : c)),
      },
    })),

  setCriterionWinner: (criterionId, subjectId) =>
    set((s) => ({
      project: {
        ...s.project,
        criteria: s.project.criteria.map((c) =>
          c.id === criterionId ? { ...c, winner_subject_id: subjectId } : c,
        ),
      },
    })),

  removeCriterion: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        criteria: s.project.criteria.filter((c) => c.id !== id),
        cells: s.project.cells.filter((cv) => cv.criterion_id !== id),
      },
    })),

  addSubject: (su) =>
    set((s) => ({
      project: {
        ...s.project,
        subjects: [...s.project.subjects, { ...su, id: crypto.randomUUID() }],
      },
    })),

  removeSubject: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        subjects: s.project.subjects.filter((su) => su.id !== id),
        cells: s.project.cells.filter((cv) => cv.subject_id !== id),
        criteria: s.project.criteria.map((c) =>
          c.winner_subject_id === id ? { ...c, winner_subject_id: null } : c,
        ),
        metadata:
          s.project.metadata.final_winner_id === id
            ? { ...s.project.metadata, final_winner_id: null }
            : s.project.metadata,
      },
    })),

  setCell: (subjectId, criterionId, text, color) =>
    set((s) => {
      const idx = s.project.cells.findIndex(
        (cv) => cv.subject_id === subjectId && cv.criterion_id === criterionId,
      );
      const updated: CellValue = { subject_id: subjectId, criterion_id: criterionId, text, color };
      const cells =
        idx >= 0
          ? s.project.cells.map((cv, i) => (i === idx ? updated : cv))
          : [...s.project.cells, updated];
      return { project: { ...s.project, cells } };
    }),

  importData: (parsed) =>
    set((s) => {
      // Merge subjects — skip duplicates by name (case-insensitive)
      const existingNames = new Set(s.project.subjects.map((su) => su.name.toLowerCase()));
      const newSubjects: Subject[] = parsed.subjects
        .filter((su) => !existingNames.has(su.name.toLowerCase()))
        .map((su) => ({ ...su, id: crypto.randomUUID() }));
      const allSubjects = [...s.project.subjects, ...newSubjects];

      // Name → id map (covers both existing and newly added)
      const nameToId = new Map(allSubjects.map((su) => [su.name.toLowerCase(), su.id]));

      // New criteria with fresh IDs
      const newCriteria: Criterion[] = parsed.criteria.map((c) => ({
        ...c,
        id: crypto.randomUUID(),
      }));
      const criteriaIds = newCriteria.map((c) => c.id);

      // Subject IDs in the order they appear in the parsed import
      const subjectIds = parsed.subjects.map((su) => nameToId.get(su.name.toLowerCase()) ?? '');

      const newCells = buildCellValues(parsed.criteria, criteriaIds, parsed.subjects, subjectIds, parsed.cells);

      return {
        project: {
          ...s.project,
          subjects: allSubjects,
          criteria: [...s.project.criteria, ...newCriteria],
          cells: [...s.project.cells, ...newCells],
        },
      };
    }),

  exportMarkdown: () => {
    try {
      downloadMarkdown(get().project);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  setView: (view) => set({ view }),
  clearError: () => set({ error: null }),
  resetProject: () =>
    set({
      project: {
        ...defaultProject,
        metadata: { ...defaultProject.metadata, created_date: today() },
      },
      error: null,
    }),
}));

export const getCell = (
  cells: CellValue[],
  subjectId: string,
  criterionId: string,
): CellValue | undefined =>
  cells.find((cv) => cv.subject_id === subjectId && cv.criterion_id === criterionId);
