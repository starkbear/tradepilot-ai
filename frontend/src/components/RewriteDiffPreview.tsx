import { buildDiffLines } from '../lib/diff'

type RewriteDiffPreviewProps = {
  currentContent: string
  newContent: string
}

export function RewriteDiffPreview({ currentContent, newContent }: RewriteDiffPreviewProps) {
  const diffLines = buildDiffLines(currentContent, newContent)

  return (
    <section aria-label="Rewrite diff preview">
      <h4>Diff Preview</h4>
      <pre>{diffLines.join('\n')}</pre>
    </section>
  )
}
