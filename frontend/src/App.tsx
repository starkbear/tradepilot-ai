import { useEffect, useState } from 'react'

import { ArtifactPanel } from './components/ArtifactPanel'
import { LoginShell } from './components/LoginShell'
import { WorkspacePanel } from './components/WorkspacePanel'
import { DEFAULT_MODEL, DEFAULT_PROVIDER_ID } from './lib/defaults'
import {
  applyFiles,
  clearGenerationHistory,
  clearSession,
  deleteGeneration,
  generateArtifact,
  loadSession,
  loginLocalSession,
  readWorkspaceFile,
  restoreGeneration,
} from './lib/api'
import type {
  ApplyResult,
  GenerationArtifact,
  GenerationHistoryEntry,
  PersistedSessionSnapshot,
  ScreenState,
} from './lib/types'

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('login')
  const [displayName, setDisplayName] = useState('')
  const [workspacePath, setWorkspacePath] = useState('')
  const [goal, setGoal] = useState('')
  const [recentWorkspaces, setRecentWorkspaces] = useState<string[]>([])
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryEntry[]>([])
  const [expandedGenerationId, setExpandedGenerationId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [artifact, setArtifact] = useState<GenerationArtifact | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedFilePaths, setSelectedFilePaths] = useState<string[]>([])
  const [selectedChangePath, setSelectedChangePath] = useState<string | null>(null)
  const [selectedChangePaths, setSelectedChangePaths] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isClearingSession, setIsClearingSession] = useState(false)
  const [isRestoringGeneration, setIsRestoringGeneration] = useState(false)
  const [isManagingGenerationHistory, setIsManagingGenerationHistory] = useState(false)
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null)
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null)
  const [rewritePreviewStatus, setRewritePreviewStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [rewritePreviewCurrentContent, setRewritePreviewCurrentContent] = useState<string | null>(null)
  const [rewritePreviewError, setRewritePreviewError] = useState<string | null>(null)

  function resetPreviewState() {
    setRewritePreviewStatus('idle')
    setRewritePreviewCurrentContent(null)
    setRewritePreviewError(null)
  }

  function applyRestoredSession(snapshot: PersistedSessionSnapshot) {
    setDisplayName(snapshot.display_name)
    setScreen(snapshot.screen)
    setWorkspacePath(snapshot.workspace_path)
    setGoal(snapshot.goal)
    setRecentWorkspaces(snapshot.recent_workspaces)
    setGenerationHistory(snapshot.generation_history)
    setArtifact(snapshot.artifact)
    setApplyResult(snapshot.apply_result)
    setApplyErrorMessage(null)
    setErrorMessage(null)
    setExpandedGenerationId(null)
    resetPreviewState()

    if (snapshot.artifact) {
      setSelectedFilePath(snapshot.selected_file_path ?? snapshot.artifact.files[0]?.path ?? null)
      setSelectedFilePaths(
        snapshot.selected_file_paths.length > 0
          ? snapshot.selected_file_paths
          : snapshot.artifact.files.map((file) => file.path),
      )
      setSelectedChangePath(snapshot.selected_change_path)
      setSelectedChangePaths(
        snapshot.selected_change_paths.length > 0
          ? snapshot.selected_change_paths
          : snapshot.artifact.changes.map((change) => change.path),
      )
      return
    }

    setSelectedFilePath(null)
    setSelectedFilePaths([])
    setSelectedChangePath(null)
    setSelectedChangePaths([])
  }

  function applyGeneratedArtifact(nextArtifact: GenerationArtifact) {
    setArtifact(nextArtifact)
    setSelectedFilePath(nextArtifact.files[0]?.path ?? null)
    setSelectedFilePaths(nextArtifact.files.map((file) => file.path))
    setSelectedChangePath(null)
    setSelectedChangePaths(nextArtifact.changes.map((change) => change.path))
    setApplyResult(null)
    setApplyErrorMessage(null)
    resetPreviewState()
  }

  useEffect(() => {
    let isCancelled = false

    loadSession()
      .then((snapshot) => {
        if (!isCancelled) {
          applyRestoredSession(snapshot)
        }
      })
      .catch(() => {
        // Fall back to the blank login flow when no persisted session is available.
      })

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    const selectedChange = artifact?.changes.find((change) => change.path === selectedChangePath) ?? null

    if (!selectedChange || selectedChange.mode !== 'rewrite') {
      setRewritePreviewStatus('idle')
      setRewritePreviewCurrentContent(null)
      setRewritePreviewError(null)
      return
    }

    let isCancelled = false
    setRewritePreviewStatus('loading')
    setRewritePreviewCurrentContent(null)
    setRewritePreviewError(null)

    readWorkspaceFile({
      workspacePath,
      path: selectedChange.path,
    })
      .then((result) => {
        if (isCancelled) {
          return
        }

        setRewritePreviewStatus('ready')
        setRewritePreviewCurrentContent(result.content)
      })
      .catch((error) => {
        if (isCancelled) {
          return
        }

        setRewritePreviewStatus('error')
        setRewritePreviewCurrentContent(null)
        setRewritePreviewError(error instanceof Error ? error.message : 'Reading file failed')
      })

    return () => {
      isCancelled = true
    }
  }, [artifact, selectedChangePath, workspacePath])

  async function handleGenerate() {
    setErrorMessage(null)
    setApplyResult(null)
    setApplyErrorMessage(null)
    setIsGenerating(true)

    try {
      const nextArtifact = await generateArtifact({
        message: goal,
        workspacePath,
        providerId: DEFAULT_PROVIDER_ID,
        model: DEFAULT_MODEL,
      })
      applyGeneratedArtifact(nextArtifact)
      try {
        const snapshot = await loadSession()
        applyRestoredSession(snapshot)
      } catch {
        // Keep the freshly generated artifact visible even if session refresh fails.
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleContinue() {
    const snapshot = await loginLocalSession({ displayName })
    applyRestoredSession(snapshot)
  }

  async function handleClearSession() {
    setIsClearingSession(true)
    try {
      const snapshot = await clearSession()
      applyRestoredSession(snapshot)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Clearing session failed')
    } finally {
      setIsClearingSession(false)
    }
  }

  function handleToggleGenerationPreview(generationId: string) {
    setExpandedGenerationId((current) => (current === generationId ? null : generationId))
  }

  async function handleRestoreGeneration(generationId: string) {
    setIsRestoringGeneration(true)
    setErrorMessage(null)

    try {
      const snapshot = await restoreGeneration(generationId)
      applyRestoredSession(snapshot)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Restoring generation failed')
    } finally {
      setIsRestoringGeneration(false)
    }
  }

  async function handleDeleteGeneration(generationId: string) {
    setIsManagingGenerationHistory(true)
    setErrorMessage(null)

    try {
      const snapshot = await deleteGeneration(generationId)
      applyRestoredSession(snapshot)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Deleting generation failed')
    } finally {
      setIsManagingGenerationHistory(false)
    }
  }

  async function handleClearGenerationHistory() {
    setIsManagingGenerationHistory(true)
    setErrorMessage(null)

    try {
      const snapshot = await clearGenerationHistory()
      applyRestoredSession(snapshot)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Clearing generation history failed')
    } finally {
      setIsManagingGenerationHistory(false)
    }
  }

  function handleToggleFile(path: string) {
    setSelectedFilePaths((current) =>
      current.includes(path) ? current.filter((entry) => entry !== path) : [...current, path],
    )
  }

  function handleToggleChange(path: string) {
    setSelectedChangePaths((current) =>
      current.includes(path) ? current.filter((entry) => entry !== path) : [...current, path],
    )
  }

  function handleSelectFile(path: string) {
    setSelectedFilePath(path)
    setSelectedChangePath(null)
  }

  function handleSelectChange(path: string) {
    setSelectedChangePath(path)
    setSelectedFilePath(null)
  }

  async function handleApplySelected() {
    if (!artifact) {
      return
    }

    setApplyErrorMessage(null)
    setApplyResult(null)
    setIsApplying(true)

    try {
      const files = artifact.files
        .filter((file) => selectedFilePaths.includes(file.path))
        .map((file) => ({ ...file, selected: true }))
      const changes = artifact.changes
        .filter((change) => selectedChangePaths.includes(change.path))
        .map((change) => ({ ...change, selected: true }))

      const result = await applyFiles({
        workspacePath,
        files,
        changes,
      })
      setApplyResult(result)
    } catch (error) {
      setApplyErrorMessage(error instanceof Error ? error.message : 'Applying files failed')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <main className="app-shell">
      {screen === 'login' ? (
        <LoginShell
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          onContinue={handleContinue}
        />
      ) : (
        <section className="workspace-layout">
          <WorkspacePanel
            workspacePath={workspacePath}
            goal={goal}
            recentWorkspaces={recentWorkspaces}
            generationHistory={generationHistory}
            expandedGenerationId={expandedGenerationId}
            errorMessage={errorMessage}
            isGenerating={isGenerating}
            isClearingSession={isClearingSession}
            isRestoringGeneration={isRestoringGeneration}
            isManagingGenerationHistory={isManagingGenerationHistory}
            onWorkspacePathChange={setWorkspacePath}
            onGoalChange={setGoal}
            onGenerate={handleGenerate}
            onSelectRecentWorkspace={setWorkspacePath}
            onClearSession={handleClearSession}
            onRestoreGeneration={handleRestoreGeneration}
            onDeleteGeneration={handleDeleteGeneration}
            onClearGenerationHistory={handleClearGenerationHistory}
            onToggleGenerationPreview={handleToggleGenerationPreview}
          />
          {artifact ? (
            <ArtifactPanel
              artifact={artifact}
              selectedFilePath={selectedFilePath}
              selectedFilePaths={selectedFilePaths}
              selectedChangePath={selectedChangePath}
              selectedChangePaths={selectedChangePaths}
              rewritePreviewStatus={rewritePreviewStatus}
              rewritePreviewCurrentContent={rewritePreviewCurrentContent}
              rewritePreviewError={rewritePreviewError}
              isApplying={isApplying}
              applyResult={applyResult}
              applyErrorMessage={applyErrorMessage}
              onSelectFile={handleSelectFile}
              onToggleFile={handleToggleFile}
              onSelectChange={handleSelectChange}
              onToggleChange={handleToggleChange}
              onApplySelected={handleApplySelected}
            />
          ) : null}
        </section>
      )}
    </main>
  )
}
