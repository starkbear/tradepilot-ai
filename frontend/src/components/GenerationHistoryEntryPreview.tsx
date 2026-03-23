import type { GenerationHistoryEntry } from '../lib/types'

type GenerationHistoryEntryPreviewProps = {
  entry: GenerationHistoryEntry
}

export function GenerationHistoryEntryPreview({ entry }: GenerationHistoryEntryPreviewProps) {
  const warningCount = entry.artifact.warnings.length
  const nextStepCount = entry.artifact.next_steps.length

  return (
    <section className="generation-history-preview" aria-label={`Preview ${entry.goal}`}>
      <p className="generation-history-preview-architecture">{entry.artifact.architecture}</p>
      <p className="generation-history-preview-summary">{entry.summary}</p>
      <ul className="generation-history-preview-list">
        <li>{`Project Tree Items: ${entry.artifact.project_tree.length}`}</li>
        <li>{`Warnings: ${warningCount}`}</li>
        <li>{`Next Steps: ${nextStepCount}`}</li>
      </ul>
      {warningCount > 0 ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Warnings</p>
          <ul className="generation-history-preview-list">
            {entry.artifact.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {nextStepCount > 0 ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Next Steps</p>
          <ul className="generation-history-preview-list">
            {entry.artifact.next_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
