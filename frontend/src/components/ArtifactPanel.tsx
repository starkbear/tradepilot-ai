import { ApplyPanel } from './ApplyPanel'
import type { ApplyResult, GenerationArtifact } from '../lib/types'
import { FilePreview } from './FilePreview'

type ArtifactPanelProps = {
  artifact: GenerationArtifact
  selectedFilePath: string | null
  selectedFilePaths: string[]
  isApplying: boolean
  applyResult: ApplyResult | null
  applyErrorMessage: string | null
  onSelectFile: (path: string) => void
  onToggleFile: (path: string) => void
  onApplySelected: () => void
}

export function ArtifactPanel({
  artifact,
  selectedFilePath,
  selectedFilePaths,
  isApplying,
  applyResult,
  applyErrorMessage,
  onSelectFile,
  onToggleFile,
  onApplySelected,
}: ArtifactPanelProps) {
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
            const isPreviewed = file.path === selectedFile?.path
            const isChecked = selectedFilePaths.includes(file.path)

            return (
              <li key={file.path} className="file-list-item">
                <div className="file-select-row">
                  <input
                    type="checkbox"
                    aria-label={file.path}
                    checked={isChecked}
                    onChange={() => onToggleFile(file.path)}
                  />
                  <button
                    type="button"
                    className={`file-select-button${isPreviewed ? ' is-selected' : ''}`}
                    aria-pressed={isPreviewed}
                    onClick={() => onSelectFile(file.path)}
                  >
                    {file.path}
                  </button>
                </div>
                <p>{file.purpose}</p>
              </li>
            )
          })}
        </ul>
        {selectedFile ? <FilePreview file={selectedFile} /> : null}
      </section>

      {artifact.files.length > 0 ? (
        <ApplyPanel
          selectedCount={selectedFilePaths.length}
          totalCount={artifact.files.length}
          isApplying={isApplying}
          applyResult={applyResult}
          applyErrorMessage={applyErrorMessage}
          onApply={onApplySelected}
        />
      ) : null}

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
