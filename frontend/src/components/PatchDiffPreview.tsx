type PatchDiffPreviewProps = {
  oldSnippet: string | null
  newContent: string
}

function toLines(content: string | null): string[] {
  if (!content) {
    return []
  }

  const normalized = content.endsWith('\n') ? content.slice(0, -1) : content
  return normalized ? normalized.split('\n') : []
}

function buildDiffLines(oldLines: string[], newLines: string[]) {
  let prefixLength = 0
  while (
    prefixLength < oldLines.length &&
    prefixLength < newLines.length &&
    oldLines[prefixLength] === newLines[prefixLength]
  ) {
    prefixLength += 1
  }

  let oldSuffixIndex = oldLines.length - 1
  let newSuffixIndex = newLines.length - 1
  while (
    oldSuffixIndex >= prefixLength &&
    newSuffixIndex >= prefixLength &&
    oldLines[oldSuffixIndex] === newLines[newSuffixIndex]
  ) {
    oldSuffixIndex -= 1
    newSuffixIndex -= 1
  }

  const diffLines: string[] = []

  for (const line of oldLines.slice(0, prefixLength)) {
    diffLines.push(` ${line}`)
  }

  for (const line of oldLines.slice(prefixLength, oldSuffixIndex + 1)) {
    diffLines.push(`-${line}`)
  }

  for (const line of newLines.slice(prefixLength, newSuffixIndex + 1)) {
    diffLines.push(`+${line}`)
  }

  for (const line of oldLines.slice(oldSuffixIndex + 1)) {
    diffLines.push(` ${line}`)
  }

  return diffLines
}

export function PatchDiffPreview({ oldSnippet, newContent }: PatchDiffPreviewProps) {
  const diffLines = buildDiffLines(toLines(oldSnippet), toLines(newContent))

  return (
    <section aria-label="Patch diff preview">
      <h4>Diff Preview</h4>
      <pre>{diffLines.join('\n')}</pre>
    </section>
  )
}
