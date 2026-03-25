import type { GenerationArtifact, GenerationHistoryEntry } from '../lib/types'
import { GenerationHistoryPanel } from './GenerationHistoryPanel'
import { ProviderSetupNotice } from './ProviderSetupNotice'

type WorkspacePanelProps = {
  workspacePath: string
  goal: string
  recentWorkspaces: string[]
  generationHistory: GenerationHistoryEntry[]
  activeGenerationId: string | null
  expandedGenerationId: string | null
  currentArtifact?: GenerationArtifact | null
  errorMessage: string | null
  isGenerating: boolean
  isClearingSession?: boolean
  isRestoringGeneration?: boolean
  isManagingGenerationHistory?: boolean
  onWorkspacePathChange: (value: string) => void
  onGoalChange: (value: string) => void
  onGenerate: () => void
  onSelectRecentWorkspace: (value: string) => void
  onClearSession: () => void
  onRestoreGeneration: (generationId: string) => void
  onDeleteGeneration: (generationId: string) => void
  onClearGenerationHistory: () => void
  onToggleGenerationPreview: (generationId: string) => void
}

export function WorkspacePanel({
  workspacePath,
  goal,
  recentWorkspaces,
  generationHistory,
  activeGenerationId,
  expandedGenerationId,
  currentArtifact = null,
  errorMessage,
  isGenerating,
  isClearingSession = false,
  isRestoringGeneration = false,
  isManagingGenerationHistory = false,
  onWorkspacePathChange,
  onGoalChange,
  onGenerate,
  onSelectRecentWorkspace,
  onClearSession,
  onRestoreGeneration,
  onDeleteGeneration,
  onClearGenerationHistory,
  onToggleGenerationPreview,
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
      {recentWorkspaces.length > 0 ? (
        <section className="workspace-shortcuts" aria-label="Recent workspaces">
          <h2>Recent Workspaces</h2>
          <div className="workspace-shortcut-list">
            {recentWorkspaces.map((entry) => (
              <button
                key={entry}
                type="button"
                className="workspace-shortcut"
                onClick={() => onSelectRecentWorkspace(entry)}
              >
                {entry}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <GenerationHistoryPanel
        entries={generationHistory}
        activeGenerationId={activeGenerationId}
        isRestoring={isRestoringGeneration}
        isManagingHistory={isManagingGenerationHistory}
        expandedGenerationId={expandedGenerationId}
        currentArtifact={currentArtifact}
        onRestore={onRestoreGeneration}
        onRemove={onDeleteGeneration}
        onClear={onClearGenerationHistory}
        onTogglePreview={onToggleGenerationPreview}
      />
      <label className="field">
        <span>Project Goal</span>
        <textarea value={goal} onChange={(event) => onGoalChange(event.target.value)} />
      </label>
      <div className="workspace-actions">
        <button type="button" disabled={!canGenerate} onClick={onGenerate}>
          {isGenerating ? 'Generating...' : 'Generate Scaffold'}
        </button>
        <button type="button" className="secondary-button" disabled={isClearingSession} onClick={onClearSession}>
          {isClearingSession ? 'Clearing...' : 'Clear Saved Session'}
        </button>
      </div>
      {needsOpenAiSetup ? <ProviderSetupNotice errorMessage={errorMessage ?? ''} /> : null}
      {errorMessage && !needsOpenAiSetup ? <p className="error-message">{errorMessage}</p> : null}
    </section>
  )
}

