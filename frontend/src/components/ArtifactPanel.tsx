import type { GenerationArtifact } from '../lib/types'
import { FilePreview } from './FilePreview'

type ArtifactPanelProps = {
  artifact: GenerationArtifact
  selectedFilePath: string | null
  onSelectFile: (path: string) => void
}

export function ArtifactPanel({ artifact, selectedFilePath, onSelectFile }: ArtifactPanelProps) {
  const selectedFile = artifact.files.find((file) => file.path === selectedFilePath) ?? artifact.files[0]

  return (
    <section className="panel artifact-panel">
      <header className="artifact-header">
        <h2>Generated Plan</h2>
        <p className="artifact-summary">{artifact.summary}</p>
      </header>

      <section className="artifact-section">
        <h3>Architecture</h3>
        <p>{artifact.architecture}</p>
      </section>

      <section className="artifact-section">
        <h3>Project Tree</h3>
        <ul className="artifact-list">
          {artifact.project_tree.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </section>

      <section className="artifact-section">
        <h3>Files</h3>
        <ul className="artifact-list file-list">
          {artifact.files.map((file) => {
            const isSelected = file.path === selectedFile?.path

            return (
              <li key={file.path}>
                <button
                  type="button"
                  className={`file-select-button${isSelected ? ' is-selected' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectFile(file.path)}
                >
                  {file.path}
                </button>
                <p>{file.purpose}</p>
              </li>
            )
          })}
        </ul>
        {selectedFile ? <FilePreview file={selectedFile} /> : null}
      </section>

      {artifact.warnings.length > 0 ? (
        <section className="artifact-section warning-section">
          <h3>Warnings</h3>
          <ul className="artifact-list">
            {artifact.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {artifact.next_steps.length > 0 ? (
        <section className="artifact-section">
          <h3>Next Steps</h3>
          <ul className="artifact-list">
            {artifact.next_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  )
}
