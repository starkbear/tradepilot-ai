import type { FileChangeDraft } from '../lib/types'

type ChangePreviewProps = {
  change: FileChangeDraft
}

export function ChangePreview({ change }: ChangePreviewProps) {
  return (
    <article className="file-preview">
      <h3>Change Preview</h3>
      <p className="preview-path">{change.path}</p>
      <p>{change.reason}</p>
      <p>Mode: {change.mode}</p>
      {change.old_snippet ? (
        <>
          <h4>Current Snippet</h4>
          <pre>{change.old_snippet}</pre>
        </>
      ) : null}
      <h4>New Content</h4>
      <pre>{change.new_content}</pre>
    </article>
  )
}
