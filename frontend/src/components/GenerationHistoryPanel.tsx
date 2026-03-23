import type { GenerationHistoryEntry } from '../lib/types'

type GenerationHistoryPanelProps = {
  entries: GenerationHistoryEntry[]
  isRestoring: boolean
  isManagingHistory: boolean
  onRestore: (generationId: string) => void
  onRemove: (generationId: string) => void
  onClear: () => void
}

export function GenerationHistoryPanel({
  entries,
  isRestoring,
  isManagingHistory,
  onRestore,
  onRemove,
  onClear,
}: GenerationHistoryPanelProps) {
  if (entries.length === 0) {
    return null
  }

  const isBusy = isRestoring || isManagingHistory

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
          <li key={entry.id} className="generation-history-item">
            <div className="generation-history-copy">
              <p className="generation-history-goal">{entry.goal}</p>
              <p className="generation-history-summary">{entry.summary}</p>
            </div>
            <div className="generation-history-actions">
              <button
                type="button"
                className="secondary-button"
                aria-label={`Restore ${entry.goal}`}
                disabled={isBusy}
                onClick={() => onRestore(entry.id)}
              >
                {isRestoring ? 'Restoring...' : 'Restore'}
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
          </li>
        ))}
      </ul>
    </section>
  )
}
