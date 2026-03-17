import { ProviderSetupNotice } from './ProviderSetupNotice'

type WorkspacePanelProps = {
  workspacePath: string
  goal: string
  errorMessage: string | null
  isGenerating: boolean
  onWorkspacePathChange: (value: string) => void
  onGoalChange: (value: string) => void
  onGenerate: () => void
}

export function WorkspacePanel({
  workspacePath,
  goal,
  errorMessage,
  isGenerating,
  onWorkspacePathChange,
  onGoalChange,
  onGenerate,
}: WorkspacePanelProps) {
  const canGenerate = Boolean(workspacePath.trim() && goal.trim()) && !isGenerating
  const needsOpenAiSetup = errorMessage?.includes('OPENAI_API_KEY') ?? false

  return (
    <section className="panel workspace-panel">
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
      {needsOpenAiSetup ? <ProviderSetupNotice errorMessage={errorMessage ?? ''} /> : null}
      {errorMessage && !needsOpenAiSetup ? <p className="error-message">{errorMessage}</p> : null}
    </section>
  )
}
