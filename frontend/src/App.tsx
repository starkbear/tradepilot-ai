import { useEffect, useState } from 'react'

import { ArtifactPanel } from './components/ArtifactPanel'
import { LoginShell } from './components/LoginShell'
import { WorkspacePanel } from './components/WorkspacePanel'
import { DEFAULT_MODEL, DEFAULT_PROVIDER_ID } from './lib/defaults'
import { applyFiles, generateArtifact } from './lib/api'
import type { ApplyResult, GenerationArtifact, ScreenState } from './lib/types'

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('login')
  const [displayName, setDisplayName] = useState('')
  const [workspacePath, setWorkspacePath] = useState('')
  const [goal, setGoal] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [artifact, setArtifact] = useState<GenerationArtifact | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedFilePaths, setSelectedFilePaths] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null)
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (artifact?.files.length) {
      setSelectedFilePath(artifact.files[0].path)
      setSelectedFilePaths(artifact.files.map((file) => file.path))
      setApplyResult(null)
      setApplyErrorMessage(null)
      return
    }

    setSelectedFilePath(null)
    setSelectedFilePaths([])
  }, [artifact])

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
      setArtifact(nextArtifact)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleToggleFile(path: string) {
    setSelectedFilePaths((current) =>
      current.includes(path) ? current.filter((entry) => entry !== path) : [...current, path],
    )
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

      const result = await applyFiles({
        workspacePath,
        files,
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
          onContinue={() => setScreen('workspace')}
        />
      ) : (
        <section className="workspace-layout">
          <WorkspacePanel
            workspacePath={workspacePath}
            goal={goal}
            errorMessage={errorMessage}
            isGenerating={isGenerating}
            onWorkspacePathChange={setWorkspacePath}
            onGoalChange={setGoal}
            onGenerate={handleGenerate}
          />
          {artifact ? (
            <ArtifactPanel
              artifact={artifact}
              selectedFilePath={selectedFilePath}
              selectedFilePaths={selectedFilePaths}
              isApplying={isApplying}
              applyResult={applyResult}
              applyErrorMessage={applyErrorMessage}
              onSelectFile={setSelectedFilePath}
              onToggleFile={handleToggleFile}
              onApplySelected={handleApplySelected}
            />
          ) : null}
        </section>
      )}
    </main>
  )
}
