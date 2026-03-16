type WorkspacePanelProps = {
  workspacePath: string
  onWorkspacePathChange: (value: string) => void
  canGenerate: boolean
}

export function WorkspacePanel({ workspacePath, onWorkspacePathChange, canGenerate }: WorkspacePanelProps) {
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
      <button type="button" disabled={!canGenerate}>
        Generate Scaffold
      </button>
    </section>
  )
}
