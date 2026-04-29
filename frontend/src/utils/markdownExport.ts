import type { ComparisonProject } from '../types';

export function buildMarkdown(project: ComparisonProject): string {
  const { metadata, criteria, subjects, cells } = project;

  const cellIndex = new Map(cells.map((c) => [`${c.subject_id}:${c.criterion_id}`, c]));
  const finalWinner = subjects.find((s) => s.id === metadata.final_winner_id);

  const parts: string[] = [];

  // YAML frontmatter
  const tagList = metadata.tags.length > 0
    ? metadata.tags.map((t) => `"${t}"`).join(', ')
    : '"comparison", "resolved"';
  parts.push(
    `---\ntags: [${tagList}]\ndate: ${metadata.created_date}\ntitle: "${metadata.title}"${
      finalWinner ? `\nwinner: "${finalWinner.name}"` : ''
    }\n---\n`,
  );

  // Title + winner declaration
  parts.push(`# ${metadata.title}\n`);
  if (finalWinner) parts.push(`**Winner: ${finalWinner.name}**\n`);

  // Comparison matrix
  parts.push('## Comparison Matrix\n');
  const subjectCols = subjects.map((s) => s.name).join(' | ');
  const sepCols = subjects.map(() => '---').join(' | ');
  const tableRows = [
    `| Criterion | Importance | ${subjectCols} | Winner |`,
    `| --- | --- | ${sepCols} | --- |`,
    ...criteria.map((c) => {
      const winner = subjects.find((s) => s.id === c.winner_subject_id);
      const cellTexts = subjects
        .map((s) => cellIndex.get(`${s.id}:${c.id}`)?.text || '—')
        .join(' | ');
      const imp = c.importance.charAt(0).toUpperCase() + c.importance.slice(1);
      return `| ${c.name} | ${imp} | ${cellTexts} | ${winner?.name ?? '—'} |`;
    }),
  ];
  parts.push(tableRows.join('\n') + '\n');

  // Winner tally
  parts.push('## Winner Tally\n');
  const tallyRows = [
    '| Subject | High Wins | Medium Wins | Low Wins | Total |',
    '| --- | --- | --- | --- | --- |',
    ...subjects.map((s) => {
      const high   = criteria.filter((c) => c.importance === 'high'   && c.winner_subject_id === s.id).length;
      const medium = criteria.filter((c) => c.importance === 'medium' && c.winner_subject_id === s.id).length;
      const low    = criteria.filter((c) => c.importance === 'low'    && c.winner_subject_id === s.id).length;
      const marker = s.id === metadata.final_winner_id ? ' ★' : '';
      return `| ${s.name}${marker} | ${high} | ${medium} | ${low} | ${high + medium + low} |`;
    }),
  ];
  parts.push(tallyRows.join('\n') + '\n');

  // Notes
  if (metadata.notes.trim()) {
    parts.push('## Notes\n');
    parts.push(metadata.notes.trim() + '\n');
  }

  return parts.join('\n');
}

export function downloadMarkdown(project: ComparisonProject): void {
  const content = buildMarkdown(project);
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.metadata.title.replace(/\s+/g, '_').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
