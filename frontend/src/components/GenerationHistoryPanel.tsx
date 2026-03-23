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

  return (
    <section className="generation-history" aria-label="Recent generations">
      <div className="generation-history-header">
        <h2>Recent Generations</h2>
        <button type="button" className="secondary-button" disabled={isBusy} onClick={onClear}>
          {isManagingHistory ? 'Clearing...' : 'Clear History'}
        </button>
      </div>
      <ul className="generation-history-list">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={`generation-history-item${activeGenerationId === entry.id ? ' is-active' : ''}`}
          >
            <div className="generation-history-copy">
              <div className="generation-history-title-row">
                <p className="generation-history-goal">{entry.goal}</p>
                {activeGenerationId === entry.id ? <span className="generation-history-badge">Active</span> : null}
              </div>
              <p className="generation-history-meta">{`Saved ${formatSavedAt(entry.created_at)}`}</p>
              <p className="generation-history-summary">{entry.summary}</p>
              <p className="generation-history-meta">
                {`${entry.artifact.files.length} files • ${entry.artifact.changes.length} changes`}
              </p>
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
        ))}
      </ul>
    </section>
  )
}
