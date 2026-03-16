type LoginShellProps = {
  displayName: string
  onDisplayNameChange: (value: string) => void
  onContinue: () => void
}

export function LoginShell({ displayName, onDisplayNameChange, onContinue }: LoginShellProps) {
  return (
    <section className="panel">
      <h1>Trading System Assistant</h1>
      <label className="field">
        <span>Display Name</span>
        <input
          type="text"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
        />
      </label>
      <button type="button" onClick={onContinue} disabled={!displayName.trim()}>
        Enter Workspace
      </button>
    </section>
  )
}
