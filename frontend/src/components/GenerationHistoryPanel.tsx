import type { GenerationHistoryEntry } from '../lib/types'

type GenerationHistoryPanelProps = {
  entries: GenerationHistoryEntry[]
  isRestoring: boolean
  onRestore: (generationId: string) => void
}

export function GenerationHistoryPanel({
  entries,
  isRestoring,
  onRestore,
}: GenerationHistoryPanelProps) {
  if (entries.length === 0) {
    return null
  }

  return (
    <section className="generation-history" aria-label="Recent generations">
      <h2>Recent Generations</h2>
      <ul className="generation-history-list">
        {entries.map((entry) => (
          <li key={entry.id} className="generation-history-item">
            <div className="generation-history-copy">
              <p className="generation-history-goal">{entry.goal}</p>
              <p className="generation-history-summary">{entry.summary}</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              disabled={isRestoring}
              onClick={() => onRestore(entry.id)}
            >
              {isRestoring ? 'Restoring...' : `Restore ${entry.goal}`}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
