import type { GenerationArtifact } from '../lib/types'

type WorkspacePanelProps = {
  workspacePath: string
  goal: string
  errorMessage: string | null
  isGenerating: boolean
  onWorkspacePathChange: (value: string) => void
  onGoalChange: (value: string) => void
  onGenerate: () => void
  artifact?: GenerationArtifact | null
}

export function WorkspacePanel({
  workspacePath,
  goal,
  errorMessage,
  isGenerating,
  onWorkspacePathChange,
  onGoalChange,
  onGenerate,
  artifact,
}: WorkspacePanelProps) {
  const canGenerate = Boolean(workspacePath.trim() && goal.trim()) && !isGenerating

  return (
    <section className="panel">
      <h1>Trading System Assistant</h1>
      <label className="field">
        <span>Workspace Path</span>
        <input
          type="text"
          value={workspacePath}
          onChange={(event) => onWorkspacePathChange(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Project Goal</span>
        <textarea value={goal} onChange={(event) => onGoalChange(event.target.value)} />
      </label>
      <button type="button" disabled={!canGenerate} onClick={onGenerate}>
        {isGenerating ? 'Generating...' : 'Generate Scaffold'}
      </button>
      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
      {artifact ? <p className="artifact-summary">{artifact.summary}</p> : null}
    </section>
  )
}
