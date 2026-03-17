type ProviderSetupNoticeProps = {
  errorMessage: string
}

export function ProviderSetupNotice({ errorMessage }: ProviderSetupNoticeProps) {
  return (
    <aside className="setup-notice" aria-live="polite">
      <h2>Connect OpenAI</h2>
      <p>Set your OpenAI API key in PowerShell before generating a scaffold.</p>
      <pre>
        <code>$env:OPENAI_API_KEY="your_api_key_here"</code>
      </pre>
      <p>After setting the key, click Generate Scaffold again.</p>
      <p className="setup-note-detail">{errorMessage}</p>
    </aside>
  )
}
