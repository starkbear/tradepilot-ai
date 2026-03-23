import type { GenerationHistoryEntry } from '../lib/types'
import { GenerationHistoryEntryPreview } from './GenerationHistoryEntryPreview'

type GenerationHistoryPanelProps = {
  entries: GenerationHistoryEntry[]
  activeGenerationId: string | null
  isRestoring: boolean
  isManagingHistory: boolean
  expandedGenerationId: string | null
  onRestore: (generationId: string) => void
  onRemove: (generationId: string) => void
  onClear: () => void
  onTogglePreview: (generationId: string) => void
}

type HistoryBadge = {
  label: string
  className: string
}

export function GenerationHistoryPanel({
  entries,
  activeGenerationId,
  isRestoring,
  isManagingHistory,
  expandedGenerationId,
  onRestore,
  onRemove,
  onClear,
  onTogglePreview,
}: GenerationHistoryPanelProps) {
  if (entries.length === 0) {
    return null
  }

  const isBusy = isRestoring || isManagingHistory

  function formatSavedAt(createdAt: string) {
    return createdAt.replace('T', ' ').slice(0, 16) + ' UTC'
  }

  function buildApplySummary(entry: GenerationHistoryEntry) {
    const applySummary = entry.apply_summary

    if (!applySummary) {
      return null
    }

    const issueLabel =
      applySummary.issue_count === 1 ? '1 issues' : `${applySummary.issue_count} issues`

    return [
      `Applied ${applySummary.applied_count} items`,
      `${applySummary.applied_files_count} files 鈥?${applySummary.applied_changes_count} changes`,
      issueLabel,
    ]
  }

  function getLifecycleBadge(entry: GenerationHistoryEntry): HistoryBadge {
    const applySummary = entry.apply_summary

    if (!applySummary) {
      return { label: 'Draft', className: 'is-draft' }
    }

    if (applySummary.issue_count > 0 || applySummary.error_count > 0) {
      return { label: 'Needs Attention', className: 'is-attention' }
    }

    if (applySummary.applied_count > 0) {
      return { label: 'Applied', className: 'is-applied' }
    }

    return { label: 'Draft', className: 'is-draft' }
  }

  return (
    <section className="generation-history" aria-label="Recent generations">
      <div className="generation-history-header">
        <h2>Recent Generations</h2>
        <button type="button" className="secondary-button" disabled={isBusy} onClick={onClear}>
          {isManagingHistory ? 'Clearing...' : 'Clear History'}
        </button>
      </div>
      <ul className="generation-history-list">
        {entries.map((entry) => {
          const lifecycleBadge = getLifecycleBadge(entry)

          return (
            <li
              key={entry.id}
              className={`generation-history-item${activeGenerationId === entry.id ? ' is-active' : ''}`}
            >
              <div className="generation-history-copy">
                <div className="generation-history-title-row">
                  <p className="generation-history-goal">{entry.goal}</p>
                  {activeGenerationId === entry.id ? (
                    <span className="generation-history-badge is-active">Active</span>
                  ) : null}
                  <span className={`generation-history-badge ${lifecycleBadge.className}`}>
                    {lifecycleBadge.label}
                  </span>
                </div>
                <p className="generation-history-meta">{`Saved ${formatSavedAt(entry.created_at)}`}</p>
                <p className="generation-history-summary">{entry.summary}</p>
                <p className="generation-history-meta">
                  {`${entry.artifact.files.length} files 鈥?${entry.artifact.changes.length} changes`}
                </p>
                {buildApplySummary(entry)?.map((line) => (
                  <p key={`${entry.id}-${line}`} className="generation-history-meta">
                    {line}
                  </p>
                ))}
              </div>
              <div className="generation-history-actions">
                <button
                  type="button"
                  className="secondary-button"
                  aria-label={`${expandedGenerationId === entry.id ? 'Hide Preview' : 'Preview'} ${entry.goal}`}
                  disabled={isBusy}
                  onClick={() => onTogglePreview(entry.id)}
                >
                  {expandedGenerationId === entry.id ? 'Hide Preview' : 'Preview'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  aria-label={`${activeGenerationId === entry.id ? 'Current' : 'Restore'} ${entry.goal}`}
                  disabled={isBusy || activeGenerationId === entry.id}
                  onClick={() => onRestore(entry.id)}
                >
                  {activeGenerationId === entry.id ? 'Current' : isRestoring ? 'Restoring...' : 'Restore'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  aria-label={`Remove ${entry.goal}`}
                  disabled={isBusy}
                  onClick={() => onRemove(entry.id)}
                >
                  {isManagingHistory ? 'Removing...' : 'Remove'}
                </button>
              </div>
              {expandedGenerationId === entry.id ? <GenerationHistoryEntryPreview entry={entry} /> : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
