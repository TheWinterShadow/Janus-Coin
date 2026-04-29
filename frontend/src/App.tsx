import { useState } from 'react';
import { useMCDA } from './store';
import { Header } from './components/Header';
import { MatrixView } from './components/MatrixView';
import { ResultsView } from './components/ResultsView';
import { AddCriterionModal } from './components/AddCriterionModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { ImportModal } from './components/ImportModal';

export default function App() {
  const view = useMCDA((s) => s.view);
  const error = useMCDA((s) => s.error);
  const clearError = useMCDA((s) => s.clearError);

  const [showAddCriterion, setShowAddCriterion] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Header
        onAddCriterion={() => setShowAddCriterion(true)}
        onAddSubject={() => setShowAddSubject(true)}
        onImport={() => setShowImport(true)}
      />

      <main className="pt-20 pb-12 px-4 max-w-[1600px] mx-auto">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0 text-red-500">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="shrink-0 text-red-500 hover:text-red-300 cursor-pointer transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        {view === 'matrix' ? (
          <MatrixView
            onAddCriterion={() => setShowAddCriterion(true)}
            onAddSubject={() => setShowAddSubject(true)}
          />
        ) : (
          <ResultsView />
        )}
      </main>

      {showAddCriterion && <AddCriterionModal onClose={() => setShowAddCriterion(false)} />}
      {showAddSubject   && <AddSubjectModal   onClose={() => setShowAddSubject(false)} />}
      {showImport       && <ImportModal       onClose={() => setShowImport(false)} />}
    </div>
  );
}
