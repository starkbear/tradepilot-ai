import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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

describe('GenerationHistoryEntryPreview', () => {
  it('renders path detail lists and overflow messaging for comparison differences', () => {
    const entry = createEntry({
      artifact: createArtifact({
        files: [
          { path: 'backend/api.py', purpose: 'api', content: '', selected: true },
          { path: 'backend/main.py', purpose: 'main', content: '', selected: true },
          { path: 'docs/plan.md', purpose: 'docs', content: '', selected: true },
          { path: 'frontend/App.tsx', purpose: 'app', content: '', selected: true },
          { path: 'shared/config.json', purpose: 'shared', content: '', selected: true },
        ],
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
          {
            path: 'backend/settings.py',
            mode: 'patch',
            reason: 'settings',
            old_snippet: 'old',
            new_content: 'new',
            selected: true,
            replace_all_matches: false,
          },
          {
            path: 'frontend/dashboard.tsx',
            mode: 'rewrite',
            reason: 'dashboard',
            old_snippet: null,
            new_content: 'new',
            selected: true,
            replace_all_matches: false,
          },
          {
            path: 'shared/theme.ts',
            mode: 'rewrite',
            reason: 'theme',
            old_snippet: null,
            new_content: 'new',
            selected: true,
            replace_all_matches: false,
          },
          {
            path: 'shared/worker.ts',
            mode: 'rewrite',
            reason: 'worker',
            old_snippet: null,
            new_content: 'new',
            selected: true,
            replace_all_matches: false,
          },
        ],
      }),
    })

    const currentArtifact = createArtifact({
      files: [
        { path: 'current/alpha.py', purpose: 'alpha', content: '', selected: true },
        { path: 'current/beta.py', purpose: 'beta', content: '', selected: true },
        { path: 'current/gamma.py', purpose: 'gamma', content: '', selected: true },
        { path: 'current/zeta.py', purpose: 'zeta', content: '', selected: true },
        { path: 'shared/config.json', purpose: 'shared', content: '', selected: true },
      ],
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
        {
          path: 'current/change-beta.ts',
          mode: 'patch',
          reason: 'beta',
          old_snippet: 'old',
          new_content: 'new',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'current/change-gamma.ts',
          mode: 'rewrite',
          reason: 'gamma',
          old_snippet: null,
          new_content: 'new',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'current/change-zeta.ts',
          mode: 'rewrite',
          reason: 'zeta',
          old_snippet: null,
          new_content: 'new',
          selected: true,
          replace_all_matches: false,
        },
        {
          path: 'shared/theme.ts',
          mode: 'rewrite',
          reason: 'theme',
          old_snippet: null,
          new_content: 'new',
          selected: true,
          replace_all_matches: false,
        },
      ],
    })

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} />)

    const comparison = screen.getByText(/compared to current/i).closest('div')
    expect(comparison).not.toBeNull()
    const scope = within(comparison as HTMLElement)

    expect(scope.getByText(/files only in this generation: 4/i)).toBeInTheDocument()
    expect(scope.getByText(/files only in current: 4/i)).toBeInTheDocument()
    expect(scope.getByText(/changes only in this generation: 4/i)).toBeInTheDocument()
    expect(scope.getByText(/changes only in current: 4/i)).toBeInTheDocument()

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

  it('keeps showing only the active message for the active generation', () => {
    const entry = createEntry()
    const currentArtifact = createArtifact({
      files: [{ path: 'shared/config.json', purpose: 'shared', content: '', selected: true }],
    })

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={currentArtifact} isActive />)

    expect(screen.getByText(/this is the active generation/i)).toBeInTheDocument()
    expect(screen.queryByText(/compared to current/i)).not.toBeInTheDocument()
  })

  it('hides the comparison block when there is no current artifact', () => {
    const entry = createEntry()

    render(<GenerationHistoryEntryPreview entry={entry} currentArtifact={null} />)

    expect(screen.queryByText(/compared to current/i)).not.toBeInTheDocument()
  })
})
