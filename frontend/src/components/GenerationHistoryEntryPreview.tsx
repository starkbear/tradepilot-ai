import { useState } from 'react'

import type { FileChangeDraft, FileDraft, GenerationArtifact, GenerationHistoryEntry } from '../lib/types'

type GenerationHistoryEntryPreviewProps = {
  entry: GenerationHistoryEntry
  currentArtifact?: GenerationArtifact | null
  isActive?: boolean
}

type ComparisonSummary = {
  onlyInPreviewFiles: number
  onlyInCurrentFiles: number
  matchingFiles: number
  driftedFiles: number
  onlyInPreviewChanges: number
  onlyInCurrentChanges: number
  matchingChanges: number
  driftedChanges: number
  onlyInPreviewFilesPaths: string[]
  onlyInCurrentFilesPaths: string[]
  onlyInPreviewChangesPaths: string[]
  onlyInCurrentChangesPaths: string[]
  matchingFilesPaths: string[]
  driftedFilesPaths: string[]
  matchingChangesPaths: string[]
  driftedChangesPaths: string[]
}

type ComparisonDetailList = {
  key: string
  label: string
  paths: string[]
}

type RecoveryGuidance = {
  title: string
  body: string
}

type CopyState = {
  key: string
  status: 'success' | 'error'
  count: number
} | null

type FilterQueries = Record<string, string>

const DETAIL_PATH_LIMIT = 3

function sortedDifference(source: Set<string>, target: Set<string>) {
  return [...source].filter((path) => !target.has(path)).sort((left, right) => left.localeCompare(right))
}

function sortedIntersection(left: Set<string>, right: Set<string>) {
  return [...left].filter((path) => right.has(path)).sort((a, b) => a.localeCompare(b))
}

function buildPathMap<T extends { path: string }>(items: T[]) {
  return new Map(items.map((item) => [item.path, item]))
}

function buildMatchingAndDriftedPaths<T extends { path: string }>(
  sharedPaths: string[],
  previewMap: Map<string, T>,
  currentMap: Map<string, T>,
  getSignature: (item: T) => string,
) {
  const matchingPaths: string[] = []
  const driftedPaths: string[] = []

  sharedPaths.forEach((path) => {
    const previewItem = previewMap.get(path)
    const currentItem = currentMap.get(path)

    if (!previewItem || !currentItem) {
      driftedPaths.push(path)
      return
    }

    if (getSignature(previewItem) === getSignature(currentItem)) {
      matchingPaths.push(path)
      return
    }

    driftedPaths.push(path)
  })

  return { matchingPaths, driftedPaths }
}

function buildFileSignature(file: FileDraft) {
  return file.content
}

function buildChangeSignature(change: FileChangeDraft) {
  return JSON.stringify({
    mode: change.mode,
    old_snippet: change.old_snippet ?? '',
    new_content: change.new_content,
    replace_all_matches: change.replace_all_matches,
  })
}

function buildComparisonSummary(previewArtifact: GenerationArtifact, currentArtifact: GenerationArtifact): ComparisonSummary {
  const previewFiles = new Set(previewArtifact.files.map((file) => file.path))
  const currentFiles = new Set(currentArtifact.files.map((file) => file.path))
  const previewChanges = new Set(previewArtifact.changes.map((change) => change.path))
  const currentChanges = new Set(currentArtifact.changes.map((change) => change.path))

  const previewFileMap = buildPathMap(previewArtifact.files)
  const currentFileMap = buildPathMap(currentArtifact.files)
  const previewChangeMap = buildPathMap(previewArtifact.changes)
  const currentChangeMap = buildPathMap(currentArtifact.changes)

  const onlyInPreviewFilesPaths = sortedDifference(previewFiles, currentFiles)
  const onlyInCurrentFilesPaths = sortedDifference(currentFiles, previewFiles)
  const onlyInPreviewChangesPaths = sortedDifference(previewChanges, currentChanges)
  const onlyInCurrentChangesPaths = sortedDifference(currentChanges, previewChanges)
  const sharedFilesPaths = sortedIntersection(previewFiles, currentFiles)
  const sharedChangesPaths = sortedIntersection(previewChanges, currentChanges)

  const { matchingPaths: matchingFilesPaths, driftedPaths: driftedFilesPaths } = buildMatchingAndDriftedPaths(
    sharedFilesPaths,
    previewFileMap,
    currentFileMap,
    buildFileSignature,
  )
  const { matchingPaths: matchingChangesPaths, driftedPaths: driftedChangesPaths } = buildMatchingAndDriftedPaths(
    sharedChangesPaths,
    previewChangeMap,
    currentChangeMap,
    buildChangeSignature,
  )

  return {
    onlyInPreviewFiles: onlyInPreviewFilesPaths.length,
    onlyInCurrentFiles: onlyInCurrentFilesPaths.length,
    matchingFiles: matchingFilesPaths.length,
    driftedFiles: driftedFilesPaths.length,
    onlyInPreviewChanges: onlyInPreviewChangesPaths.length,
    onlyInCurrentChanges: onlyInCurrentChangesPaths.length,
    matchingChanges: matchingChangesPaths.length,
    driftedChanges: driftedChangesPaths.length,
    onlyInPreviewFilesPaths,
    onlyInCurrentFilesPaths,
    onlyInPreviewChangesPaths,
    onlyInCurrentChangesPaths,
    matchingFilesPaths,
    driftedFilesPaths,
    matchingChangesPaths,
    driftedChangesPaths,
  }
}

function buildComparisonDetails(summary: ComparisonSummary): ComparisonDetailList[] {
  return [
    { key: 'preview-files', label: 'Files only in this generation', paths: summary.onlyInPreviewFilesPaths },
    { key: 'current-files', label: 'Files only in current', paths: summary.onlyInCurrentFilesPaths },
    { key: 'preview-changes', label: 'Changes only in this generation', paths: summary.onlyInPreviewChangesPaths },
    { key: 'current-changes', label: 'Changes only in current', paths: summary.onlyInCurrentChangesPaths },
  ].filter((detail) => detail.paths.length > 0)
}

function buildSharedDetails(summary: ComparisonSummary): ComparisonDetailList[] {
  return [
    { key: 'matching-files', label: 'Matching files', paths: summary.matchingFilesPaths },
    { key: 'drifted-files', label: 'Drifted files', paths: summary.driftedFilesPaths },
    { key: 'matching-changes', label: 'Matching changes', paths: summary.matchingChangesPaths },
    { key: 'drifted-changes', label: 'Drifted changes', paths: summary.driftedChangesPaths },
  ].filter((detail) => detail.paths.length > 0)
}

function buildRecoveryGuidance(summary: ComparisonSummary): RecoveryGuidance {
  const driftedCount = summary.driftedFiles + summary.driftedChanges
  const previewOnlyCount = summary.onlyInPreviewFiles + summary.onlyInPreviewChanges
  const currentOnlyCount = summary.onlyInCurrentFiles + summary.onlyInCurrentChanges

  if (driftedCount > 0 || currentOnlyCount > 0) {
    return {
      title: 'Review before restoring',
      body: 'Some drifted paths differ from the current generation, so review the preview before restoring it.',
    }
  }

  if (previewOnlyCount > 0) {
    return {
      title: 'Restore when ready',
      body: 'This preview adds new files or changes without shared drift, so it is ready when you want to continue from it.',
    }
  }

  return {
    title: 'Stay with current',
    body: 'This history entry already matches the current generation, so there is nothing new to restore right now.',
  }
}

function getVisiblePaths(paths: string[], isExpanded: boolean, query: string) {
  if (!isExpanded) {
    return {
      displayPaths: paths.slice(0, DETAIL_PATH_LIMIT),
      hiddenCount: Math.max(paths.length - DETAIL_PATH_LIMIT, 0),
      filteredPathCount: paths.length,
    }
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPaths = normalizedQuery.length > 0
    ? paths.filter((path) => path.toLowerCase().includes(normalizedQuery))
    : paths

  return {
    displayPaths: filteredPaths,
    hiddenCount: Math.max(paths.length - DETAIL_PATH_LIMIT, 0),
    filteredPathCount: filteredPaths.length,
  }
}

function getSharedToggleLabel(detailKey: string, isVisible: boolean) {
  const action = isVisible ? 'Hide' : 'Show'

  if (detailKey === 'matching-files') {
    return `${action} matching files`
  }

  if (detailKey === 'drifted-files') {
    return `${action} drifted files`
  }

  if (detailKey === 'matching-changes') {
    return `${action} matching changes`
  }

  return `${action} drifted changes`
}

export function GenerationHistoryEntryPreview({
  entry,
  currentArtifact = null,
  isActive = false,
}: GenerationHistoryEntryPreviewProps) {
  const [copyState, setCopyState] = useState<CopyState>(null)
  const [expandedDetailKeys, setExpandedDetailKeys] = useState<string[]>([])
  const [visibleSharedDetailKeys, setVisibleSharedDetailKeys] = useState<string[]>([])
  const [filterQueries, setFilterQueries] = useState<FilterQueries>({})
  const warningCount = entry.artifact.warnings.length
  const nextStepCount = entry.artifact.next_steps.length
  const applySummary = entry.apply_summary
  const comparisonSummary = !isActive && currentArtifact ? buildComparisonSummary(entry.artifact, currentArtifact) : null
  const recoveryGuidance = comparisonSummary ? buildRecoveryGuidance(comparisonSummary) : null
  const comparisonDetails = comparisonSummary ? buildComparisonDetails(comparisonSummary) : []
  const sharedDetails = comparisonSummary ? buildSharedDetails(comparisonSummary) : []
  const visibleSharedDetails = sharedDetails.filter((detail) => visibleSharedDetailKeys.includes(detail.key))
  const visibleDetails = [...comparisonDetails, ...visibleSharedDetails]

  function formatTimestamp(value: string) {
    return value.replace('T', ' ').slice(0, 16) + ' UTC'
  }

  async function handleCopyPaths(detail: ComparisonDetailList) {
    try {
      await navigator.clipboard.writeText(detail.paths.join('\n'))
      setCopyState({ key: detail.key, status: 'success', count: detail.paths.length })
    } catch {
      setCopyState({ key: detail.key, status: 'error', count: detail.paths.length })
    }
  }

  function clearFilterQuery(detailKey: string) {
    setFilterQueries((currentQueries) => {
      if (!(detailKey in currentQueries)) {
        return currentQueries
      }

      const nextQueries = { ...currentQueries }
      delete nextQueries[detailKey]
      return nextQueries
    })
  }

  function toggleExpanded(detailKey: string) {
    setExpandedDetailKeys((currentKeys) =>
      currentKeys.includes(detailKey)
        ? currentKeys.filter((key) => key !== detailKey)
        : [...currentKeys, detailKey],
    )
    clearFilterQuery(detailKey)
  }

  function toggleSharedDetail(detailKey: string) {
    setVisibleSharedDetailKeys((currentKeys) =>
      currentKeys.includes(detailKey)
        ? currentKeys.filter((key) => key !== detailKey)
        : [...currentKeys, detailKey],
    )
    setExpandedDetailKeys((currentKeys) => currentKeys.filter((key) => key !== detailKey))
    clearFilterQuery(detailKey)
  }

  function updateFilterQuery(detailKey: string, value: string) {
    setFilterQueries((currentQueries) => ({
      ...currentQueries,
      [detailKey]: value,
    }))
  }

  return (
    <section className="generation-history-preview" aria-label={`Preview ${entry.goal}`}>
      <p className="generation-history-preview-architecture">{entry.artifact.architecture}</p>
      <p className="generation-history-preview-summary">{entry.summary}</p>
      <ul className="generation-history-preview-list">
        <li>{`Project Tree Items: ${entry.artifact.project_tree.length}`}</li>
        <li>{`Warnings: ${warningCount}`}</li>
        <li>{`Next Steps: ${nextStepCount}`}</li>
      </ul>
      {isActive ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Current Status</p>
          <p className="generation-history-preview-note">This is the active generation.</p>
        </div>
      ) : comparisonSummary ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Compared to Current</p>
          <ul className="generation-history-preview-list">
            <li>{`Files Only in This Generation: ${comparisonSummary.onlyInPreviewFiles}`}</li>
            <li>{`Files Only in Current: ${comparisonSummary.onlyInCurrentFiles}`}</li>
            <li>{`Matching Files: ${comparisonSummary.matchingFiles}`}</li>
            <li>{`Drifted Files: ${comparisonSummary.driftedFiles}`}</li>
            <li>{`Changes Only in This Generation: ${comparisonSummary.onlyInPreviewChanges}`}</li>
            <li>{`Changes Only in Current: ${comparisonSummary.onlyInCurrentChanges}`}</li>
            <li>{`Matching Changes: ${comparisonSummary.matchingChanges}`}</li>
            <li>{`Drifted Changes: ${comparisonSummary.driftedChanges}`}</li>
          </ul>
          {recoveryGuidance ? (
            <div className="generation-history-preview-block">
              <p className="generation-history-preview-label">Suggested Next Step</p>
              <p className="generation-history-preview-summary">{recoveryGuidance.title}</p>
              <p className="generation-history-preview-note">{recoveryGuidance.body}</p>
            </div>
          ) : null}
          {sharedDetails.length > 0 ? (
            <div className="generation-history-actions">
              {sharedDetails.map((detail) => {
                const isVisible = visibleSharedDetailKeys.includes(detail.key)

                return (
                  <button
                    key={detail.key}
                    type="button"
                    className="secondary-button"
                    onClick={() => toggleSharedDetail(detail.key)}
                  >
                    {getSharedToggleLabel(detail.key, isVisible)}
                  </button>
                )
              })}
            </div>
          ) : null}
          {visibleDetails.map((detail) => {
            const isExpanded = expandedDetailKeys.includes(detail.key)
            const query = filterQueries[detail.key] ?? ''
            const { displayPaths, hiddenCount, filteredPathCount } = getVisiblePaths(detail.paths, isExpanded, query)
            const detailCopyState = copyState?.key === detail.key ? copyState : null

            return (
              <div key={detail.key} className="generation-history-preview-block">
                <div className="generation-history-header">
                  <p className="generation-history-preview-label">{detail.label}</p>
                  <div className="generation-history-actions">
                    {hiddenCount > 0 ? (
                      <button type="button" className="secondary-button" onClick={() => toggleExpanded(detail.key)}>
                        {isExpanded ? 'Show less' : 'Show all'}
                      </button>
                    ) : null}
                    <button type="button" className="secondary-button" onClick={() => handleCopyPaths(detail)}>
                      Copy Paths
                    </button>
                  </div>
                </div>
                {isExpanded && hiddenCount > 0 ? (
                  <input
                    type="text"
                    className="generation-history-filter-input"
                    placeholder="Filter paths"
                    value={query}
                    onChange={(event) => updateFilterQuery(detail.key, event.target.value)}
                  />
                ) : null}
                <ul className="generation-history-preview-list">
                  {displayPaths.map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                  {hiddenCount > 0 && !isExpanded ? <li>{`+${hiddenCount} more`}</li> : null}
                </ul>
                {isExpanded && hiddenCount > 0 && filteredPathCount === 0 ? (
                  <p className="generation-history-preview-note">No matching paths.</p>
                ) : null}
                {detailCopyState?.status === 'success' ? (
                  <p className="generation-history-preview-note">{`Copied ${detailCopyState.count} paths`}</p>
                ) : null}
                {detailCopyState?.status === 'error' ? (
                  <p className="generation-history-preview-note">Copy failed</p>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
      {applySummary ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Apply Summary</p>
          <ul className="generation-history-preview-list">
            <li>{`Validated: ${applySummary.validated_count}`}</li>
            <li>{`Applied: ${applySummary.applied_count}`}</li>
            <li>{`Files: ${applySummary.applied_files_count}`}</li>
            <li>{`Changes: ${applySummary.applied_changes_count}`}</li>
            <li>{`Issues: ${applySummary.issue_count}`}</li>
            <li>{`Errors: ${applySummary.error_count}`}</li>
            <li>{`Last Applied: ${formatTimestamp(applySummary.last_applied_at)}`}</li>
          </ul>
        </div>
      ) : null}
      {warningCount > 0 ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Warnings</p>
          <ul className="generation-history-preview-list">
            {entry.artifact.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {nextStepCount > 0 ? (
        <div className="generation-history-preview-block">
          <p className="generation-history-preview-label">Next Steps</p>
          <ul className="generation-history-preview-list">
            {entry.artifact.next_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
