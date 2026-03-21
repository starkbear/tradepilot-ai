import type { ApplyResult } from '../lib/types'

type ApplyPanelProps = {
  selectedCount: number
  totalCount: number
  isApplying: boolean
  applyResult: ApplyResult | null
  applyErrorMessage: string | null
  onApply: () => void
}

export function ApplyPanel({
  selectedCount,
  totalCount,
  isApplying,
  applyResult,
  applyErrorMessage,
  onApply,
}: ApplyPanelProps) {
  return (
    <section className="artifact-section apply-panel">
      <div className="apply-panel-header">
        <h3>Apply Files</h3>
        <p>
          Selected {selectedCount} of {totalCount} files
        </p>
      </div>

      <button type="button" onClick={onApply} disabled={isApplying || selectedCount === 0}>
        {isApplying ? 'Applying...' : 'Apply Selected Files'}
      </button>

      {applyErrorMessage ? <p className="error-message">{applyErrorMessage}</p> : null}

      {applyResult ? (
        <div className="apply-result-summary">
          <p>{`Validated: ${applyResult.validated.length}`}</p>
          <p>{`Applied: ${applyResult.applied.length}`}</p>
          <p>{`Skipped: ${applyResult.skipped.length}`}</p>
          <p>{`Issues: ${applyResult.issues.length}`}</p>
          {applyResult.issues.length > 0 ? (
            <ul className="artifact-list">
              {applyResult.issues.map((issue) => (
                <li key={`${issue.stage}:${issue.kind}:${issue.path}`}>
                  <p>{issue.path}</p>
                  <p>{issue.message}</p>
                  <p>{issue.suggestion}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
