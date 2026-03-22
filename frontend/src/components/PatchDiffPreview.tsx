import { buildDiffLines } from '../lib/diff'

type PatchDiffPreviewProps = {
  oldSnippet: string | null
  newContent: string
}

export function PatchDiffPreview({ oldSnippet, newContent }: PatchDiffPreviewProps) {
  const diffLines = buildDiffLines(oldSnippet, newContent)

  return (
    <section aria-label="Patch diff preview">
      <h4>Diff Preview</h4>
      <pre>{diffLines.join('\n')}</pre>
    </section>
  )
}
