import type { GenerationArtifact, GenerationHistoryEntry } from '../lib/types'

type GenerationHistoryEntryPreviewProps = {
  entry: GenerationHistoryEntry
  currentArtifact?: GenerationArtifact | null
  isActive?: boolean
}

type ComparisonSummary = {
  onlyInPreviewFiles: number
  onlyInCurrentFiles: number
  sharedFiles: number
  onlyInPreviewChanges: number
  onlyInCurrentChanges: number
  sharedChanges: number
}

function buildComparisonSummary(previewArtifact: GenerationArtifact, currentArtifact: GenerationArtifact): ComparisonSummary {
  const previewFiles = new Set(previewArtifact.files.map((file) => file.path))
  const currentFiles = new Set(currentArtifact.files.map((file) => file.path))
  const previewChanges = new Set(previewArtifact.changes.map((change) => change.path))
  const currentChanges = new Set(currentArtifact.changes.map((change) => change.path))

  const sharedFiles = [...previewFiles].filter((path) => currentFiles.has(path)).length
  const sharedChanges = [...previewChanges].filter((path) => currentChanges.has(path)).length

  return {
    onlyInPreviewFiles: [...previewFiles].filter((path) => !currentFiles.has(path)).length,
    onlyInCurrentFiles: [...currentFiles].filter((path) => !previewFiles.has(path)).length,
    sharedFiles,
    onlyInPreviewChanges: [...previewChanges].filter((path) => !currentChanges.has(path)).length,
    onlyInCurrentChanges: [...currentChanges].filter((path) => !previewChanges.has(path)).length,
    sharedChanges,
  }
}

export function GenerationHistoryEntryPreview({
  entry,
  currentArtifact = null,
  isActive = false,
}: GenerationHistoryEntryPreviewProps) {
  const warningCount = entry.artifact.warnings.length
  const nextStepCount = entry.artifact.next_steps.length
  const applySummary = entry.apply_summary
  const comparisonSummary = !isActive && currentArtifact ? buildComparisonSummary(entry.artifact, currentArtifact) : null

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
      {isActive ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Current Status</p>
          <p className="generation-history-preview-note">This is the active generation.</p>
        </div>
      ) : comparisonSummary ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Compared to Current</p>
          <ul className="generation-history-preview-list">
            <li>{`Files Only in This Generation: ${comparisonSummary.onlyInPreviewFiles}`}</li>
            <li>{`Files Only in Current: ${comparisonSummary.onlyInCurrentFiles}`}</li>
            <li>{`Shared Files: ${comparisonSummary.sharedFiles}`}</li>
            <li>{`Changes Only in This Generation: ${comparisonSummary.onlyInPreviewChanges}`}</li>
            <li>{`Changes Only in Current: ${comparisonSummary.onlyInCurrentChanges}`}</li>
            <li>{`Shared Changes: ${comparisonSummary.sharedChanges}`}</li>
          </ul>
        </div>
      ) : null}
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

