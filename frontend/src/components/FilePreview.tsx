import type { FileDraft } from '../lib/types'

type FilePreviewProps = {
  file: FileDraft
}

export function FilePreview({ file }: FilePreviewProps) {
  return (
    <article className="file-preview">
      <h3>Preview</h3>
      <p className="preview-path">{file.path}</p>
      <p>{file.purpose}</p>
      <pre>{file.content}</pre>
    </article>
  )
}
