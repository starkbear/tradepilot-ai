import type { GenerationArtifact } from '../lib/types'
import { FilePreview } from './FilePreview'

type ArtifactPanelProps = {
  artifact: GenerationArtifact
  onToggleFile: (path: string) => void
  onApply: () => void
}

export function ArtifactPanel({ artifact, onToggleFile, onApply }: ArtifactPanelProps) {
  const selectedPreview = artifact.files.find((file) => file.selected) ?? artifact.files[0]

  return (
    <section className="panel artifact-panel">
      <h2>Generated Plan</h2>
      <p>{artifact.summary}</p>
      <p>{artifact.architecture}</p>
      <ul className="file-list">
        {artifact.files.map((file) => (
          <li key={file.path}>
            <label>
              <input
                type="checkbox"
                checked={file.selected}
                onChange={() => onToggleFile(file.path)}
                aria-label={file.path}
              />
              <span>{file.path}</span>
            </label>
          </li>
        ))}
      </ul>
      {selectedPreview ? <FilePreview file={selectedPreview} /> : null}
      <button type="button" onClick={onApply}>
        Apply Selected Files
      </button>
    </section>
  )
}
