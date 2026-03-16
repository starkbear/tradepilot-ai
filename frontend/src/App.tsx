import { useEffect, useState } from 'react'

import { ArtifactPanel } from './components/ArtifactPanel'
import { LoginShell } from './components/LoginShell'
import { WorkspacePanel } from './components/WorkspacePanel'
import { DEFAULT_MODEL, DEFAULT_PROVIDER_ID } from './lib/defaults'
import { generateArtifact } from './lib/api'
import type { GenerationArtifact, ScreenState } from './lib/types'

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('login')
  const [displayName, setDisplayName] = useState('')
  const [workspacePath, setWorkspacePath] = useState('')
  const [goal, setGoal] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [artifact, setArtifact] = useState<GenerationArtifact | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (artifact?.files.length) {
      setSelectedFilePath(artifact.files[0].path)
      return
    }

    setSelectedFilePath(null)
  }, [artifact])

  async function handleGenerate() {
    setErrorMessage(null)
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
              onSelectFile={setSelectedFilePath}
            />
          ) : null}
        </section>
      )}
    </main>
  )
}
