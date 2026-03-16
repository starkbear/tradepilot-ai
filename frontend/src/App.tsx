import { useState } from 'react'

import { LoginShell } from './components/LoginShell'
import { WorkspacePanel } from './components/WorkspacePanel'
import type { ScreenState } from './lib/types'

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('login')
  const [displayName, setDisplayName] = useState('')
  const [workspacePath, setWorkspacePath] = useState('')

  return (
    <main className="app-shell">
      {screen === 'login' ? (
        <LoginShell
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          onContinue={() => setScreen('workspace')}
        />
      ) : (
        <WorkspacePanel
          workspacePath={workspacePath}
          onWorkspacePathChange={setWorkspacePath}
          canGenerate={false}
        />
      )}
    </main>
  )
}
