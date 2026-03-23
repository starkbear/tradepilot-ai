import type { GenerationHistoryEntry } from '../lib/types'

type GenerationHistoryEntryPreviewProps = {
  entry: GenerationHistoryEntry
}

export function GenerationHistoryEntryPreview({ entry }: GenerationHistoryEntryPreviewProps) {
  const warningCount = entry.artifact.warnings.length
  const nextStepCount = entry.artifact.next_steps.length
  const applySummary = entry.apply_summary

  function formatTimestamp(value: string) {
    return value.replace('T', ' ').slice(0, 16) + ' UTC'
  }

  return (
    <section className="generation-history-preview" aria-label={`Preview ${entry.goal}`}>
      <p className="generation-history-preview-architecture">{entry.artifact.architecture}</p>
      <p className="generation-history-preview-summary">{entry.summary}</p>
      <ul className="generation-history-preview-list">
        <li>{`Project Tree Items: ${entry.artifact.project_tree.length}`}</li>
        <li>{`Warnings: ${warningCount}`}</li>
        <li>{`Next Steps: ${nextStepCount}`}</li>
      </ul>
      {applySummary ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Apply Summary</p>
          <ul className="generation-history-preview-list">
            <li>{`Validated: ${applySummary.validated_count}`}</li>
            <li>{`Applied: ${applySummary.applied_count}`}</li>
            <li>{`Files: ${applySummary.applied_files_count}`}</li>
            <li>{`Changes: ${applySummary.applied_changes_count}`}</li>
            <li>{`Issues: ${applySummary.issue_count}`}</li>
            <li>{`Errors: ${applySummary.error_count}`}</li>
            <li>{`Last Applied: ${formatTimestamp(applySummary.last_applied_at)}`}</li>
          </ul>
        </div>
      ) : null}
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
