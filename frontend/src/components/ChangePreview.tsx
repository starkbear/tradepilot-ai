import type { FileChangeDraft } from '../lib/types'
import { PatchDiffPreview } from './PatchDiffPreview'
import { RewriteDiffPreview } from './RewriteDiffPreview'

type ChangePreviewProps = {
  change: FileChangeDraft
  currentContent?: string | null
  rewritePreviewStatus?: 'idle' | 'loading' | 'ready' | 'error'
  rewritePreviewError?: string | null
}

export function ChangePreview({
  change,
  currentContent = null,
  rewritePreviewStatus = 'idle',
  rewritePreviewError = null,
}: ChangePreviewProps) {
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
          {rewritePreviewStatus === 'loading' ? <p>Loading current file preview...</p> : null}
          {rewritePreviewStatus === 'ready' && currentContent !== null ? (
            <RewriteDiffPreview currentContent={currentContent} newContent={change.new_content} />
          ) : (
            <>
              <h4>Current file preview unavailable</h4>
              {rewritePreviewError ? <p>{rewritePreviewError}</p> : null}
              <h4>New Content</h4>
              <pre>{change.new_content}</pre>
            </>
          )}
        </>
      )}
    </article>
  )
}
