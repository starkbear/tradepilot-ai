import { useState } from 'react'

import type {
  CurrentArtifactPathTarget,
  FileChangeDraft,
  FileDraft,
  GenerationArtifact,
  GenerationHistoryEntry,
} from '../lib/types'
import { GenerationHistoryEntryPreview } from './GenerationHistoryEntryPreview'

type GenerationHistoryPanelProps = {
  entries: GenerationHistoryEntry[]
  activeGenerationId: string | null
  currentArtifact?: GenerationArtifact | null
  isRestoring: boolean
  isManagingHistory: boolean
  expandedGenerationId: string | null
  onRestore: (generationId: string) => void
  onRemove: (generationId: string) => void
  onClear: () => void
  onTogglePreview: (generationId: string) => void
  onOpenCurrentArtifactPath: (target: CurrentArtifactPathTarget) => void
}

type HistoryBadge = {
  label: string
  className: string
}

type HistorySection = {
  label: string
  entries: GenerationHistoryEntry[]
}

type HistoryFilter = 'all' | 'focus' | 'attention' | 'draft' | 'applied'

type HistoryFilterOption = {
  value: HistoryFilter
  label: string
}

type RecommendedActionLabel = 'Review' | 'Continue'

type EntryAction = {
  key: string
  label: string
  ariaLabel: string
  onClick: () => void
  isPrimary?: boolean
  isRecommended?: boolean
}

const FILTER_OPTIONS: HistoryFilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'focus', label: 'Focus' },
  { value: 'attention', label: 'Needs Attention' },
  { value: 'draft', label: 'Draft' },
  { value: 'applied', label: 'Applied' },
]

function formatSavedAt(createdAt: string) {
  return createdAt.replace('T', ' ').slice(0, 16) + ' UTC'
}

function buildApplySummary(entry: GenerationHistoryEntry) {
  const applySummary = entry.apply_summary

  if (!applySummary) {
    return null
  }

  const issueLabel =
    applySummary.issue_count === 1 ? '1 issues' : `${applySummary.issue_count} issues`

  return [
    `Applied ${applySummary.applied_count} items`,
    `${applySummary.applied_files_count} files / ${applySummary.applied_changes_count} changes`,
    issueLabel,
  ]
}

function getLifecycleBadge(entry: GenerationHistoryEntry): HistoryBadge {
  const applySummary = entry.apply_summary

  if (!applySummary) {
    return { label: 'Draft', className: 'is-draft' }
  }

  if (applySummary.issue_count > 0 || applySummary.error_count > 0) {
    return { label: 'Needs Attention', className: 'is-attention' }
  }

  if (applySummary.applied_count > 0) {
    return { label: 'Applied', className: 'is-applied' }
  }

  return { label: 'Draft', className: 'is-draft' }
}

function getDisplayPriority(entry: GenerationHistoryEntry, activeGenerationId: string | null) {
  const lifecycleBadge = getLifecycleBadge(entry)
  const isActive = entry.id === activeGenerationId

  if (isActive && lifecycleBadge.label === 'Needs Attention') {
    return 0
  }

  if (isActive) {
    return 1
  }

  if (lifecycleBadge.label === 'Needs Attention') {
    return 2
  }

  if (lifecycleBadge.label === 'Draft') {
    return 3
  }

  return 4
}

function sortEntries(entries: GenerationHistoryEntry[], activeGenerationId: string | null) {
  return [...entries].sort((left, right) => {
    const priorityDifference = getDisplayPriority(left, activeGenerationId) - getDisplayPriority(right, activeGenerationId)

    if (priorityDifference !== 0) {
      return priorityDifference
    }

    return right.created_at.localeCompare(left.created_at)
  })
}

function buildAllSections(entries: GenerationHistoryEntry[], activeGenerationId: string | null): HistorySection[] {
  const sortedEntries = sortEntries(entries, activeGenerationId)
  const focusEntries = sortedEntries.filter((entry) => {
    const lifecycleBadge = getLifecycleBadge(entry)
    return entry.id === activeGenerationId || lifecycleBadge.label === 'Needs Attention'
  })
  const recentEntries = sortedEntries.filter((entry) => !focusEntries.some((focusEntry) => focusEntry.id === entry.id))
  const sections: HistorySection[] = []

  if (focusEntries.length > 0) {
    sections.push({ label: 'Focus Now', entries: focusEntries })
  }

  if (recentEntries.length > 0) {
    sections.push({ label: 'Recent History', entries: recentEntries })
  }

  return sections
}

function buildFilteredSection(
  entries: GenerationHistoryEntry[],
  activeGenerationId: string | null,
  filter: Exclude<HistoryFilter, 'all'>,
): HistorySection {
  const sortedEntries = sortEntries(entries, activeGenerationId)
  const filteredEntries = sortedEntries.filter((entry) => {
    const lifecycleLabel = getLifecycleBadge(entry).label

    if (filter === 'focus') {
      return entry.id === activeGenerationId || lifecycleLabel === 'Needs Attention'
    }

    if (filter === 'attention') {
      return lifecycleLabel === 'Needs Attention'
    }

    if (filter === 'draft') {
      return lifecycleLabel === 'Draft'
    }

    return lifecycleLabel === 'Applied'
  })

  const label = FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? 'Filtered History'
  return { label, entries: filteredEntries }
}

function getEmptyStateCopy(filter: Exclude<HistoryFilter, 'all'>) {
  if (filter === 'focus') {
    return 'No focus generations right now.'
  }

  if (filter === 'attention') {
    return 'No generations need attention right now.'
  }

  if (filter === 'draft') {
    return 'No draft generations yet.'
  }

  return 'No applied generations yet.'
}

function buildPathSignatureMap<T extends { path: string }>(items: T[], getSignature: (item: T) => string) {
  return new Map(items.map((item) => [item.path, getSignature(item)]))
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

function hasCurrentOnlyPaths(previewPaths: Set<string>, currentPaths: Set<string>) {
  return [...currentPaths].some((path) => !previewPaths.has(path))
}

function hasDriftedSharedPaths(previewSignatures: Map<string, string>, currentSignatures: Map<string, string>) {
  return [...previewSignatures.entries()].some(([path, signature]) => currentSignatures.has(path) && currentSignatures.get(path) !== signature)
}

function getRecommendedActionLabel(
  entry: GenerationHistoryEntry,
  currentArtifact: GenerationArtifact | null,
  activeGenerationId: string | null,
  expandedGenerationId: string | null,
): RecommendedActionLabel | null {
  if (!currentArtifact || entry.id === activeGenerationId || expandedGenerationId !== entry.id) {
    return null
  }

  const previewFilePaths = new Set(entry.artifact.files.map((file) => file.path))
  const currentFilePaths = new Set(currentArtifact.files.map((file) => file.path))
  const previewChangePaths = new Set(entry.artifact.changes.map((change) => change.path))
  const currentChangePaths = new Set(currentArtifact.changes.map((change) => change.path))

  const hasCurrentOnlyFiles = hasCurrentOnlyPaths(previewFilePaths, currentFilePaths)
  const hasCurrentOnlyChanges = hasCurrentOnlyPaths(previewChangePaths, currentChangePaths)

  const previewFileSignatures = buildPathSignatureMap(entry.artifact.files, buildFileSignature)
  const currentFileSignatures = buildPathSignatureMap(currentArtifact.files, buildFileSignature)
  const previewChangeSignatures = buildPathSignatureMap(entry.artifact.changes, buildChangeSignature)
  const currentChangeSignatures = buildPathSignatureMap(currentArtifact.changes, buildChangeSignature)

  const hasDriftedFiles = hasDriftedSharedPaths(previewFileSignatures, currentFileSignatures)
  const hasDriftedChanges = hasDriftedSharedPaths(previewChangeSignatures, currentChangeSignatures)

  if (hasCurrentOnlyFiles || hasCurrentOnlyChanges || hasDriftedFiles || hasDriftedChanges) {
    return 'Review'
  }

  return 'Continue'
}

function buildEntryActions({
  entry,
  activeGenerationId,
  expandedGenerationId,
  currentArtifact = null,
  onRestore,
  onRemove,
  onTogglePreview,
}: {
  entry: GenerationHistoryEntry
  activeGenerationId: string | null
  expandedGenerationId: string | null
  currentArtifact?: GenerationArtifact | null
  onRestore: (generationId: string) => void
  onRemove: (generationId: string) => void
  onTogglePreview: (generationId: string) => void
}): EntryAction[] {
  const lifecycleLabel = getLifecycleBadge(entry).label
  const isActive = entry.id === activeGenerationId
  const isExpanded = expandedGenerationId === entry.id
  const recommendedActionLabel = getRecommendedActionLabel(entry, currentArtifact, activeGenerationId, expandedGenerationId)

  if (isActive) {
    return [
      {
        key: 'preview',
        label: isExpanded ? 'Hide Preview' : 'Preview',
        ariaLabel: `${isExpanded ? 'Hide Preview' : 'Preview'} ${entry.goal}`,
        onClick: () => onTogglePreview(entry.id),
        isPrimary: true,
      },
      {
        key: 'remove',
        label: 'Remove',
        ariaLabel: `Remove ${entry.goal}`,
        onClick: () => onRemove(entry.id),
      },
    ]
  }

  if (lifecycleLabel === 'Needs Attention') {
    return [
      {
        key: 'review',
        label: 'Review',
        ariaLabel: `Review ${entry.goal}`,
        onClick: () => onTogglePreview(entry.id),
        isPrimary: true,
        isRecommended: recommendedActionLabel === 'Review',
      },
      {
        key: 'restore',
        label: 'Restore',
        ariaLabel: `Restore ${entry.goal}`,
        onClick: () => onRestore(entry.id),
      },
      {
        key: 'remove',
        label: 'Remove',
        ariaLabel: `Remove ${entry.goal}`,
        onClick: () => onRemove(entry.id),
      },
    ]
  }

  return [
    {
      key: 'continue',
      label: 'Continue',
      ariaLabel: `Continue ${entry.goal}`,
      onClick: () => onRestore(entry.id),
      isPrimary: true,
      isRecommended: recommendedActionLabel === 'Continue',
    },
    {
      key: 'preview',
      label: isExpanded ? 'Hide Preview' : 'Preview',
      ariaLabel: `${isExpanded ? 'Hide Preview' : 'Preview'} ${entry.goal}`,
      onClick: () => onTogglePreview(entry.id),
    },
    {
      key: 'remove',
      label: 'Remove',
      ariaLabel: `Remove ${entry.goal}`,
      onClick: () => onRemove(entry.id),
    },
  ]
}

export function GenerationHistoryPanel({
  entries,
  activeGenerationId,
  currentArtifact = null,
  isRestoring,
  isManagingHistory,
  expandedGenerationId,
  onRestore,
  onRemove,
  onClear,
  onTogglePreview,
  onOpenCurrentArtifactPath,
}: GenerationHistoryPanelProps) {
  const [filter, setFilter] = useState<HistoryFilter>('all')

  if (entries.length === 0) {
    return null
  }

  const isBusy = isRestoring || isManagingHistory
  const sections =
    filter === 'all'
      ? buildAllSections(entries, activeGenerationId)
      : [buildFilteredSection(entries, activeGenerationId, filter)]

  return (
    <section className="generation-history" aria-label="Recent generations">
      <div className="generation-history-header">
        <h2>Recent Generations</h2>
        <button type="button" className="secondary-button" disabled={isBusy} onClick={onClear}>
          {isManagingHistory ? 'Clearing...' : 'Clear History'}
        </button>
      </div>
      <div className="generation-history-filters" aria-label="Generation history filters">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`generation-history-filter${filter === option.value ? ' is-selected' : ''}`}
            aria-pressed={filter === option.value}
            disabled={isBusy}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="generation-history-groups">
        {sections.map((section) => (
          <section key={section.label} className="generation-history-group" aria-label={section.label}>
            <h3 className="generation-history-group-title">{section.label}</h3>
            {section.entries.length === 0 ? (
              <p className="generation-history-empty">{getEmptyStateCopy(filter as Exclude<HistoryFilter, 'all'>)}</p>
            ) : (
              <ul className="generation-history-list">
                {section.entries.map((entry) => {
                  const lifecycleBadge = getLifecycleBadge(entry)
                  const actions = buildEntryActions({
                    entry,
                    activeGenerationId,
                    expandedGenerationId,
                    currentArtifact,
                    onRestore,
                    onRemove,
                    onTogglePreview,
                  })

                  return (
                    <li
                      key={entry.id}
                      className={`generation-history-item${activeGenerationId === entry.id ? ' is-active' : ''}`}
                    >
                      <div className="generation-history-copy">
                        <div className="generation-history-title-row">
                          <p className="generation-history-goal">{entry.goal}</p>
                          {activeGenerationId === entry.id ? (
                            <span className="generation-history-badge is-active">Active</span>
                          ) : null}
                          <span className={`generation-history-badge ${lifecycleBadge.className}`}>
                            {lifecycleBadge.label}
                          </span>
                        </div>
                        <p className="generation-history-meta">{`Saved ${formatSavedAt(entry.created_at)}`}</p>
                        <p className="generation-history-summary">{entry.summary}</p>
                        <p className="generation-history-meta">
                          {`${entry.artifact.files.length} files / ${entry.artifact.changes.length} changes`}
                        </p>
                        {buildApplySummary(entry)?.map((line) => (
                          <p key={`${entry.id}-${line}`} className="generation-history-meta">
                            {line}
                          </p>
                        ))}
                      </div>
                      <div className="generation-history-actions">
                        {actions.map((action) => (
                          <button
                            key={action.key}
                            type="button"
                            className={`${action.isPrimary ? 'generation-history-primary-action' : 'secondary-button'}${action.isRecommended ? ' is-recommended' : ''}`}
                            aria-label={action.ariaLabel}
                            disabled={isBusy}
                            onClick={action.onClick}
                          >
                            {action.label}
                            {action.isRecommended ? (
                              <span className="generation-history-action-marker">Recommended</span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                      {expandedGenerationId === entry.id ? (
                        <GenerationHistoryEntryPreview
                          entry={entry}
                          currentArtifact={currentArtifact}
                          isActive={activeGenerationId === entry.id}
                          onOpenCurrentArtifactPath={onOpenCurrentArtifactPath}
                        />
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  )
}


