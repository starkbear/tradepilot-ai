import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GenerationArtifact, GenerationApplySummary, GenerationHistoryEntry } from '../lib/types'
import { GenerationHistoryPanel } from './GenerationHistoryPanel'

function createArtifact(overrides: Partial<GenerationArtifact> = {}): GenerationArtifact {
  return {
    summary: 'Historical summary',
    architecture: 'Frontend + backend split.',
    project_tree: ['frontend/', 'backend/'],
    files: [],
    changes: [],
    warnings: [],
    next_steps: [],
    ...overrides,
  }
}

function createApplySummary(overrides: Partial<GenerationApplySummary> = {}): GenerationApplySummary {
  return {
    validated_count: 1,
    applied_count: 1,
    applied_files_count: 1,
    applied_changes_count: 0,
    issue_count: 0,
    error_count: 0,
    last_applied_at: '2026-04-04T09:00:00Z',
    ...overrides,
  }
}

function createEntry(overrides: Partial<GenerationHistoryEntry> = {}): GenerationHistoryEntry {
  return {
    id: 'gen-history',
    created_at: '2026-04-04T08:00:00Z',
    goal: 'Improve generation history actions',
    summary: 'Historical summary',
    artifact: createArtifact(),
    apply_summary: null,
    ...overrides,
  }
}

function renderPanel(options: {
  entries: GenerationHistoryEntry[]
  currentArtifact?: GenerationArtifact | null
  activeGenerationId?: string | null
  expandedGenerationId?: string | null
  onOpenCurrentArtifactPath?: (target: { path: string; kind: 'file' | 'change' }) => void
}) {
  return render(
    <GenerationHistoryPanel
      entries={options.entries}
      currentArtifact={options.currentArtifact ?? null}
      activeGenerationId={options.activeGenerationId ?? null}
      expandedGenerationId={options.expandedGenerationId ?? null}
      isRestoring={false}
      isManagingHistory={false}
      onRestore={vi.fn()}
      onRemove={vi.fn()}
      onClear={vi.fn()}
      onTogglePreview={vi.fn()}
      onOpenCurrentArtifactPath={options.onOpenCurrentArtifactPath ?? vi.fn()}
    />, 
  )
}

describe('GenerationHistoryPanel', () => {
  it('marks review as recommended for expanded needs-attention entries with drifted differences', () => {
    const entry = createEntry({
      apply_summary: createApplySummary({ issue_count: 1 }),
      artifact: createArtifact({
        files: [{ path: 'shared/config.json', purpose: 'config', content: 'preview', selected: true }],
      }),
    })
    const currentArtifact = createArtifact({
      files: [{ path: 'shared/config.json', purpose: 'config', content: 'current', selected: true }],
    })

    renderPanel({ entries: [entry], currentArtifact, expandedGenerationId: entry.id })

    const item = screen.getByText(entry.goal).closest('li')
    expect(item).not.toBeNull()
    const reviewButton = within(item as HTMLElement).getByRole('button', { name: /review/i })
    expect(within(reviewButton).getByText(/^recommended$/i)).toBeInTheDocument()
    expect(reviewButton.className).toMatch(/is-recommended/)
  })

  it('marks continue as recommended for expanded draft entries without shared drift', () => {
    const entry = createEntry({
      artifact: createArtifact({
        files: [{ path: 'preview/new-dashboard.tsx', purpose: 'dashboard', content: 'preview', selected: true }],
      }),
    })
    const currentArtifact = createArtifact()

    renderPanel({ entries: [entry], currentArtifact, expandedGenerationId: entry.id })

    const item = screen.getByText(entry.goal).closest('li')
    expect(item).not.toBeNull()
    const continueButton = within(item as HTMLElement).getByRole('button', { name: /continue/i })
    expect(within(continueButton).getByText(/^recommended$/i)).toBeInTheDocument()
    expect(continueButton.className).toMatch(/is-recommended/)
  })

  it('does not show recommendation markers for collapsed entries', () => {
    const entry = createEntry({
      artifact: createArtifact({
        files: [{ path: 'preview/new-dashboard.tsx', purpose: 'dashboard', content: 'preview', selected: true }],
      }),
    })

    renderPanel({ entries: [entry], currentArtifact: createArtifact() })

    expect(screen.queryByText(/^recommended$/i)).not.toBeInTheDocument()
    expect(document.querySelector('.is-recommended')).toBeNull()
  })

  it('does not show recommendation markers for active entries', () => {
    const entry = createEntry({
      id: 'active-generation',
      artifact: createArtifact({
        files: [{ path: 'shared/config.json', purpose: 'config', content: 'preview', selected: true }],
      }),
    })
    const currentArtifact = createArtifact({
      files: [{ path: 'shared/config.json', purpose: 'config', content: 'current', selected: true }],
    })

    renderPanel({
      entries: [entry],
      currentArtifact,
      activeGenerationId: entry.id,
      expandedGenerationId: entry.id,
    })

    expect(screen.queryByText(/^recommended$/i)).not.toBeInTheDocument()
    expect(document.querySelector('.is-recommended')).toBeNull()
  })

  it('passes open-current actions through to expanded preview entries', async () => {
    const user = userEvent.setup()
    const onOpenCurrentArtifactPath = vi.fn()
    const entry = createEntry({
      artifact: createArtifact({
        files: [{ path: 'shared/matching.json', purpose: 'config', content: 'preview', selected: true }],
      }),
    })
    const currentArtifact = createArtifact({
      files: [{ path: 'shared/matching.json', purpose: 'config', content: 'preview', selected: true }],
    })

    renderPanel({
      entries: [entry],
      currentArtifact,
      expandedGenerationId: entry.id,
      onOpenCurrentArtifactPath,
    })

    await user.click(screen.getByRole('button', { name: /show matching files/i }))
    await user.click(screen.getByRole('button', { name: /open current shared\/matching\.json/i }))

    expect(onOpenCurrentArtifactPath).toHaveBeenCalledWith({
      kind: 'file',
      path: 'shared/matching.json',
    })
  })
})

