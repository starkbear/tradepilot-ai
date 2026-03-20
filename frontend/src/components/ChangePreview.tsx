import type { FileChangeDraft } from '../lib/types'
import { PatchDiffPreview } from './PatchDiffPreview'

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
      {change.mode === 'patch' ? (
        <PatchDiffPreview oldSnippet={change.old_snippet} newContent={change.new_content} />
      ) : (
        <>
          <h4>New Content</h4>
          <pre>{change.new_content}</pre>
        </>
      )}
    </article>
  )
}
