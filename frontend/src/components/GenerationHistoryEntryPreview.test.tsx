import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GenerationArtifact, GenerationHistoryEntry } from '../lib/types'
import { GenerationHistoryEntryPreview } from './GenerationHistoryEntryPreview'

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

function createEntry(overrides: Partial<GenerationHistoryEntry> = {}): GenerationHistoryEntry {
  return {
    id: 'gen-history',
    created_at: '2026-03-25T10:00:00Z',
    goal: 'Improve generation history previews',
    summary: 'Historical summary',
    artifact: createArtifact(),
    ...overrides,
  }
}

function createComparisonArtifacts() {
  const entry = createEntry({
    artifact: createArtifact({
      files: [
        { path: 'backend/api.py', purpose: 'api', content: 'preview-api', selected: true },
        { path: 'backend/main.py', purpose: 'main', content: 'preview-main', selected: true },
        { path: 'docs/plan.md', purpose: 'docs', content: 'preview-plan', selected: true },
        { path: 'frontend/App.tsx', purpose: 'app', content: 'preview-app', selected: true },
        { path: 'shared/drifted.json', purpose: 'shared', content: '{"version":1}', selected: true },
        { path: 'shared/matching.json', purpose: 'shared', content: '{"version":2}', selected: true },
      ],
      changes: [
        {
          path: 'backend/routes.py',
          mode: 'patch',
          reason: 'routes',
          old_snippet: 'old-routes',
          new_content: 'new-routes',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'backend/settings.py',
          mode: 'patch',
          reason: 'settings',
          old_snippet: 'old-settings',
          new_content: 'new-settings',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'frontend/dashboard.tsx',
          mode: 'rewrite',
          reason: 'dashboard',
          old_snippet: null,
          new_content: 'preview-dashboard',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'frontend/trade.tsx',
          mode: 'rewrite',
          reason: 'trade',
          old_snippet: null,
          new_content: 'preview-trade',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'shared/drifted.ts',
          mode: 'rewrite',
          reason: 'drifted',
          old_snippet: null,
          new_content: 'preview-drifted',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'shared/matching.ts',
          mode: 'rewrite',
          reason: 'matching',
          old_snippet: null,
          new_content: 'shared-stable',
          selected: true,
          replace_all_matches: false,
        },
      ],
    }),
  })

  const currentArtifact = createArtifact({
    files: [
      { path: 'current/alpha.py', purpose: 'alpha', content: 'current-alpha', selected: true },
      { path: 'current/beta.py', purpose: 'beta', content: 'current-beta', selected: true },
      { path: 'current/gamma.py', purpose: 'gamma', content: 'current-gamma', selected: true },
      { path: 'current/zeta.py', purpose: 'zeta', content: 'current-zeta', selected: true },
      { path: 'shared/drifted.json', purpose: 'shared', content: '{"version":9}', selected: true },
      { path: 'shared/matching.json', purpose: 'shared', content: '{"version":2}', selected: true },
    ],
    changes: [
      {
        path: 'current/change-alpha.ts',
        mode: 'patch',
        reason: 'alpha',
        old_snippet: 'old-alpha',
        new_content: 'new-alpha',
        selected: true,
        replace_all_matches: false,
      },
      {
        path: 'current/change-beta.ts',
        mode: 'patch',
        reason: 'beta',
        old_snippet: 'old-beta',
        new_content: 'new-beta',
        selected: true,
        replace_all_matches: false,
      },
      {
        path: 'current/change-gamma.ts',
        mode: 'rewrite',
        reason: 'gamma',
        old_snippet: null,
        new_content: 'current-gamma',
        selected: true,
        replace_all_matches: false,
      },
      {
        path: 'current/change-zeta.ts',
        mode: 'rewrite',
        reason: 'zeta',
        old_snippet: null,
        new_content: 'current-zeta',
        selected: true,
        replace_all_matches: false,
      },
      {
        path: 'shared/drifted.ts',
        mode: 'rewrite',
        reason: 'drifted',
        old_snippet: null,
        new_content: 'current-drifted',
        selected: true,
        replace_all_matches: false,
      },
      {
        path: 'shared/matching.ts',
        mode: 'rewrite',
        reason: 'matching',
        old_snippet: null,
        new_content: 'shared-stable',
        selected: true,
        replace_all_matches: false,
      },
    ],
  })

  return { entry, currentArtifact }
}

function createAdditiveOnlyArtifacts() {
  const entry = createEntry({
    artifact: createArtifact({
      files: [
        { path: 'shared/matching.json', purpose: 'shared', content: '{"version":2}', selected: true },
        { path: 'preview-only/new-dashboard.tsx', purpose: 'dashboard', content: 'new-dashboard', selected: true },
      ],
      changes: [
        {
          path: 'shared/matching.ts',
          mode: 'rewrite',
          reason: 'matching',
          old_snippet: null,
          new_content: 'shared-stable',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'preview-only/new-routes.ts',
          mode: 'patch',
          reason: 'new-routes',
          old_snippet: 'before',
          new_content: 'after',
          selected: true,
          replace_all_matches: false,
        },
      ],
    }),
  })

  const currentArtifact = createArtifact({
    files: [{ path: 'shared/matching.json', purpose: 'shared', content: '{"version":2}', selected: true }],
    changes: [
      {
        path: 'shared/matching.ts',
        mode: 'rewrite',
        reason: 'matching',
        old_snippet: null,
        new_content: 'shared-stable',
        selected: true,
        replace_all_matches: false,
      },
    ],
  })

  return { entry, currentArtifact }
}

function createMatchingArtifacts() {
  const artifact = createArtifact({
    files: [{ path: 'shared/matching.json', purpose: 'shared', content: '{"version":2}', selected: true }],
    changes: [
      {
        path: 'shared/matching.ts',
        mode: 'rewrite',
        reason: 'matching',
        old_snippet: null,
        new_content: 'shared-stable',
        selected: true,
        replace_all_matches: false,
      },
    ],
  })

  return { entry: createEntry({ artifact }), currentArtifact: artifact }
}

describe('GenerationHistoryEntryPreview', () => {
  it('renders path detail lists, overflow messaging, and content-aware summary counts', () => {
    const { entry, currentArtifact } = createComparisonArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    const comparison = screen.getByText(/compared to current/i).closest('div')
    expect(comparison).not.toBeNull()
    const scope = within(comparison as HTMLElement)

    expect(scope.getByText(/files only in this generation: 4/i)).toBeInTheDocument()
    expect(scope.getByText(/files only in current: 4/i)).toBeInTheDocument()
    expect(scope.getByText(/matching files: 1/i)).toBeInTheDocument()
    expect(scope.getByText(/drifted files: 1/i)).toBeInTheDocument()
    expect(scope.getByText(/changes only in this generation: 4/i)).toBeInTheDocument()
    expect(scope.getByText(/changes only in current: 4/i)).toBeInTheDocument()
    expect(scope.getByText(/matching changes: 1/i)).toBeInTheDocument()
    expect(scope.getByText(/drifted changes: 1/i)).toBeInTheDocument()

    expect(scope.getByText(/backend\/api.py/i)).toBeInTheDocument()
    expect(scope.getByText(/backend\/main.py/i)).toBeInTheDocument()
    expect(scope.getByText(/docs\/plan.md/i)).toBeInTheDocument()
    expect(scope.getAllByText(/^\+1 more$/i)).toHaveLength(4)

    expect(scope.getByText(/current\/alpha.py/i)).toBeInTheDocument()
    expect(scope.getByText(/current\/beta.py/i)).toBeInTheDocument()
    expect(scope.getByText(/current\/gamma.py/i)).toBeInTheDocument()

    expect(scope.getByText(/backend\/routes.py/i)).toBeInTheDocument()
    expect(scope.getByText(/backend\/settings.py/i)).toBeInTheDocument()
    expect(scope.getByText(/frontend\/dashboard.tsx/i)).toBeInTheDocument()

    expect(scope.getByText(/current\/change-alpha.ts/i)).toBeInTheDocument()
    expect(scope.getByText(/current\/change-beta.ts/i)).toBeInTheDocument()
    expect(scope.getByText(/current\/change-gamma.ts/i)).toBeInTheDocument()
  })

  it('suggests reviewing before restoring when any drifted paths exist', () => {
    const { entry, currentArtifact } = createComparisonArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    expect(screen.getByText(/^suggested next step$/i)).toBeInTheDocument()
    expect(screen.getByText(/^review before restoring$/i)).toBeInTheDocument()
    expect(screen.getByText(/drifted paths differ from the current generation/i)).toBeInTheDocument()
    expect(screen.getByText(/^recommended action$/i)).toBeInTheDocument()
    expect(screen.getByText(/^review$/i)).toBeInTheDocument()
  })

  it('suggests restoring when the preview only adds new matching work', () => {
    const { entry, currentArtifact } = createAdditiveOnlyArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    expect(screen.getByText(/^suggested next step$/i)).toBeInTheDocument()
    expect(screen.getByText(/^restore when ready$/i)).toBeInTheDocument()
    expect(screen.getByText(/adds new files or changes without shared drift/i)).toBeInTheDocument()
    expect(screen.getByText(/^recommended action$/i)).toBeInTheDocument()
    expect(screen.getByText(/^continue$/i)).toBeInTheDocument()
  })

  it('suggests staying with current when the compared artifacts already match', () => {
    const { entry, currentArtifact } = createMatchingArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    expect(screen.getByText(/^suggested next step$/i)).toBeInTheDocument()
    expect(screen.getByText(/^stay with current$/i)).toBeInTheDocument()
    expect(screen.getByText(/already matches the current generation/i)).toBeInTheDocument()
    expect(screen.getByText(/^recommended action$/i)).toBeInTheDocument()
    expect(screen.getByText(/^continue$/i)).toBeInTheDocument()
  })

  it('reveals matching and drifted file and change details on demand', async () => {
    const user = userEvent.setup()
    const { entry, currentArtifact } = createComparisonArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    expect(screen.getByRole('button', { name: /show matching files/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show drifted files/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show matching changes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show drifted changes/i })).toBeInTheDocument()
    expect(screen.queryByText(/^matching files$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^drifted files$/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show matching files/i }))
    expect(screen.getByRole('button', { name: /hide matching files/i })).toBeInTheDocument()
    expect(screen.getByText(/^matching files$/i)).toBeInTheDocument()
    expect(screen.getByText(/shared\/matching.json/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show drifted files/i }))
    expect(screen.getByRole('button', { name: /hide drifted files/i })).toBeInTheDocument()
    expect(screen.getByText(/^drifted files$/i)).toBeInTheDocument()
    expect(screen.getByText(/shared\/drifted.json/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show matching changes/i }))
    expect(screen.getByRole('button', { name: /hide matching changes/i })).toBeInTheDocument()
    expect(screen.getByText(/^matching changes$/i)).toBeInTheDocument()
    expect(screen.getByText(/shared\/matching.ts/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show drifted changes/i }))
    expect(screen.getByRole('button', { name: /hide drifted changes/i })).toBeInTheDocument()
    expect(screen.getByText(/^drifted changes$/i)).toBeInTheDocument()
    expect(screen.getByText(/shared\/drifted.ts/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /hide matching files/i }))
    expect(screen.queryByText(/^matching files$/i)).not.toBeInTheDocument()
  })

  it('does not show matching or drifted detail toggles when there are no shared paths', () => {
    const entry = createEntry({
      artifact: createArtifact({
        files: [{ path: 'backend/api.py', purpose: 'api', content: '', selected: true }],
        changes: [
          {
            path: 'backend/routes.py',
            mode: 'patch',
            reason: 'routes',
            old_snippet: 'old',
            new_content: 'new',
            selected: true,
            replace_all_matches: false,
          },
        ],
      }),
    })

    const currentArtifact = createArtifact({
      files: [{ path: 'current/alpha.py', purpose: 'alpha', content: '', selected: true }],
      changes: [
        {
          path: 'current/change-alpha.ts',
          mode: 'patch',
          reason: 'alpha',
          old_snippet: 'old',
          new_content: 'new',
          selected: true,
          replace_all_matches: false,
        },
      ],
    })

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    expect(screen.queryByRole('button', { name: /show matching files/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show drifted files/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show matching changes/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show drifted changes/i })).not.toBeInTheDocument()
  })

  it('copies the full path list for a comparison category, including hidden overflow items', async () => {
    const user = userEvent.setup()
    const { entry, currentArtifact } = createComparisonArtifacts()
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    const section = screen.getByText(/^files only in this generation$/i).closest('div.generation-history-preview-block')
    expect(section).not.toBeNull()

    await user.click(within(section as HTMLElement).getByRole('button', { name: /copy paths/i }))

    expect(writeText).toHaveBeenCalledWith('backend/api.py\nbackend/main.py\ndocs/plan.md\nfrontend/App.tsx')
    expect(within(section as HTMLElement).getByText(/copied 4 paths/i)).toBeInTheDocument()
  })

  it('shows copy failure feedback when clipboard writes reject', async () => {
    const user = userEvent.setup()
    const { entry, currentArtifact } = createComparisonArtifacts()
    const writeText = vi.fn().mockRejectedValue(new Error('clipboard unavailable'))

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    const section = screen.getByText(/^changes only in current$/i).closest('div.generation-history-preview-block')
    expect(section).not.toBeNull()

    await user.click(within(section as HTMLElement).getByRole('button', { name: /copy paths/i }))

    expect(within(section as HTMLElement).getByText(/copy failed/i)).toBeInTheDocument()
  })

  it('expands and collapses overflowing path sections in place', async () => {
    const user = userEvent.setup()
    const { entry, currentArtifact } = createComparisonArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    const section = screen.getByText(/^files only in this generation$/i).closest('div.generation-history-preview-block')
    expect(section).not.toBeNull()
    const scope = within(section as HTMLElement)

    expect(scope.getByRole('button', { name: /show all/i })).toBeInTheDocument()
    expect(scope.queryByText(/frontend\/App.tsx/i)).not.toBeInTheDocument()
    expect(scope.getByText(/^\+1 more$/i)).toBeInTheDocument()

    await user.click(scope.getByRole('button', { name: /show all/i }))

    expect(scope.getByRole('button', { name: /show less/i })).toBeInTheDocument()
    expect(scope.getByText(/frontend\/App.tsx/i)).toBeInTheDocument()
    expect(scope.queryByText(/^\+1 more$/i)).not.toBeInTheDocument()

    await user.click(scope.getByRole('button', { name: /show less/i }))

    expect(scope.getByRole('button', { name: /show all/i })).toBeInTheDocument()
    expect(scope.queryByText(/frontend\/App.tsx/i)).not.toBeInTheDocument()
    expect(scope.getByText(/^\+1 more$/i)).toBeInTheDocument()
  })

  it('filters expanded path sections in place', async () => {
    const user = userEvent.setup()
    const { entry, currentArtifact } = createComparisonArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    const section = screen.getByText(/^files only in this generation$/i).closest('div.generation-history-preview-block')
    expect(section).not.toBeNull()
    const scope = within(section as HTMLElement)

    expect(scope.queryByPlaceholderText(/filter paths/i)).not.toBeInTheDocument()
    await user.click(scope.getByRole('button', { name: /show all/i }))

    const filterInput = scope.getByPlaceholderText(/filter paths/i)
    await user.type(filterInput, 'frontEND')

    expect(scope.getByText(/frontend\/App.tsx/i)).toBeInTheDocument()
    expect(scope.queryByText(/backend\/api.py/i)).not.toBeInTheDocument()
    expect(scope.queryByText(/^\+1 more$/i)).not.toBeInTheDocument()

    await user.clear(filterInput)
    await user.type(filterInput, 'missing')

    expect(scope.getByText(/no matching paths\./i)).toBeInTheDocument()

    await user.click(scope.getByRole('button', { name: /show less/i }))
    expect(scope.queryByPlaceholderText(/filter paths/i)).not.toBeInTheDocument()
    expect(scope.getByText(/^\+1 more$/i)).toBeInTheDocument()
  })

  it('does not show expand controls for sections without overflow', async () => {
    const user = userEvent.setup()
    const { entry, currentArtifact } = createComparisonArtifacts()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    await user.click(screen.getByRole('button', { name: /show matching files/i }))

    const section = screen.getByText(/^matching files$/i).closest('div.generation-history-preview-block')
    expect(section).not.toBeNull()
    expect(within(section as HTMLElement).queryByRole('button', { name: /show all/i })).not.toBeInTheDocument()
  })

  it('keeps showing only the active message for the active generation', () => {
    const entry = createEntry()
    const currentArtifact = createArtifact({
      files: [{ path: 'shared/config.json', purpose: 'shared', content: '', selected: true }],
    })

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} isActive />)

    expect(screen.getByText(/this is the active generation/i)).toBeInTheDocument()
    expect(screen.queryByText(/compared to current/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^suggested next step$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^recommended action$/i)).not.toBeInTheDocument()
  })

  it('hides the comparison block when there is no current artifact', () => {
    const entry = createEntry()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={null} />)

    expect(screen.queryByText(/compared to current/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^suggested next step$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^recommended action$/i)).not.toBeInTheDocument()
  })
})


