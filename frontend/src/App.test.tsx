import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

const GENERATED_ARTIFACT = {
  assistant_message: 'Here is your scaffold.',
  summary: 'MVP scaffold ready.',
  architecture: 'Frontend + backend split.',
  project_tree: ['frontend/', 'backend/'],
  files: [
    { path: 'README.md', purpose: 'docs', content: '# Demo', selected: true },
    { path: 'backend/app/main.py', purpose: 'backend entry', content: 'print("hi")', selected: true },
  ],
  changes: [
    {
      path: 'backend/app/main.py',
      mode: 'patch',
      reason: 'Register router.',
      old_snippet: 'print("hi")',
      new_content: 'print("hi")\nprint("router")',
      selected: true,
      replace_all_matches: false,
    },
    {
      path: 'frontend/src/App.tsx',
      mode: 'rewrite',
      reason: 'Replace app shell.',
      old_snippet: null,
      new_content: 'export function App() { return <main /> }',
      selected: true,
      replace_all_matches: false,
    },
  ],
  warnings: ['Placeholder provider response in use.'],
  next_steps: ['Review generated files'],
}

const RESTORED_ARTIFACT = {
  ...GENERATED_ARTIFACT,
  summary: 'Restored scaffold ready.',
  files: [
    { path: 'docs/plan.md', purpose: 'plan', content: '# Restored', selected: true },
  ],
  changes: [],
}

const EMPTY_SESSION = {
  display_name: '',
  recent_workspaces: [],
  preferred_provider: 'openai',
  screen: 'login',
  workspace_path: '',
  goal: '',
  artifact: null,
  active_generation_id: null,
  selected_file_paths: [],
  selected_change_paths: [],
  selected_file_path: null,
  selected_change_path: null,
  apply_result: null,
  generation_history: [],
}

function buildFetchResponse({ ok, status = 200, body }: { ok: boolean; status?: number; body: unknown }) {
  return {
    ok,
    status,
    json: async () => body,
  }
}

function buildSessionSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    ...EMPTY_SESSION,
    ...overrides,
  }
}

function withSessionResponse(snapshot = EMPTY_SESSION) {
  return buildFetchResponse({
    ok: true,
    body: {
      success: true,
      message: 'session loaded',
      data: snapshot,
      errors: [],
    },
  })
}

function withLoginResponse(displayName = 'Wei') {
  return buildFetchResponse({
    ok: true,
    body: {
      success: true,
      message: 'logged in',
      data: buildSessionSnapshot({
        display_name: displayName,
        screen: 'workspace',
      }),
      errors: [],
    },
  })
}

function withGenerationSessionResponse(
  artifact = GENERATED_ARTIFACT,
  overrides: Record<string, unknown> = {},
) {
  return withSessionResponse(
    buildSessionSnapshot({
      display_name: 'Wei',
      screen: 'workspace',
      workspace_path: 'D:/Codex/Trading assistant',
      goal: 'Build a stock trading system MVP',
      artifact,
      selected_file_paths: artifact.files.map((file) => file.path),
      selected_change_paths: artifact.changes.map((change) => change.path),
      selected_file_path: artifact.files[0]?.path ?? null,
      selected_change_path: null,
      generation_history: [
        {
          id: 'gen-latest',
          created_at: '2026-03-23T10:00:00Z',
          goal: 'Build a stock trading system MVP',
          summary: artifact.summary,
          artifact,
        },
      ],
      active_generation_id: 'gen-latest',
      ...overrides,
    }),
  )
}

async function logIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/display name/i), 'Wei')
  await user.click(screen.getByRole('button', { name: /enter workspace/i }))
  await screen.findByLabelText(/workspace path/i)
}

async function generateArtifact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/workspace path/i), 'D:/Codex/Trading assistant')
  await user.type(screen.getByLabelText(/project goal/i), 'Build a stock trading system MVP')
  await user.click(screen.getByRole('button', { name: /generate scaffold/i }))
  await screen.findByRole('heading', { name: /generated plan/i })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('restores the workspace state from the persisted session on startup', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      withSessionResponse(
        buildSessionSnapshot({
          display_name: 'Wei',
          screen: 'workspace',
          workspace_path: 'D:/Codex/Trading assistant',
          recent_workspaces: ['D:/Codex/Trading assistant', 'D:/Projects/TradePilot'],
          goal: 'Continue refining the trading assistant',
          artifact: GENERATED_ARTIFACT,
          selected_file_paths: ['README.md'],
          selected_change_paths: ['backend/app/main.py'],
          selected_file_path: 'README.md',
          selected_change_path: null,
          apply_result: {
            validated: ['README.md'],
            applied: ['README.md'],
            applied_files: ['README.md'],
            applied_changes: [],
            skipped: [],
            issues: [],
            errors: [],
          },
          generation_history: [
            {
              id: 'gen-1',
              created_at: '2026-03-23T09:00:00Z',
              goal: 'Continue refining the trading assistant',
              summary: 'MVP scaffold ready.',
              artifact: GENERATED_ARTIFACT,
            },
          ],
        }),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByLabelText(/workspace path/i)).toHaveValue('D:/Codex/Trading assistant')
    expect(screen.getByLabelText(/project goal/i)).toHaveValue('Continue refining the trading assistant')
    expect(screen.getByRole('heading', { name: /generated plan/i })).toBeInTheDocument()
    expect(screen.getByText(/applied: 1/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /D:\/Projects\/TradePilot/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /recent generations/i })).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: /recent generations/i })).getByRole('button', {
        name: /restore continue refining the trading assistant/i,
      }),
    ).toBeInTheDocument()
  })

  it('restores a selected generation from the history panel', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            selected_file_paths: ['README.md'],
            selected_change_paths: ['backend/app/main.py'],
            selected_file_path: 'README.md',
            selected_change_path: null,
            apply_result: {
              validated: ['README.md'],
              applied: ['README.md'],
              applied_files: ['README.md'],
              applied_changes: [],
              skipped: [],
              issues: [],
              errors: [],
            },
            generation_history: [
              {
                id: 'gen-2',
                created_at: '2026-03-23T09:15:00Z',
                goal: 'Restored goal',
                summary: 'Restored scaffold ready.',
                artifact: RESTORED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation restored',
            data: buildSessionSnapshot({
              display_name: 'Wei',
              screen: 'workspace',
              workspace_path: 'D:/Codex/Trading assistant',
              goal: 'Restored goal',
              artifact: RESTORED_ARTIFACT,
              selected_file_paths: ['docs/plan.md'],
              selected_change_paths: [],
              selected_file_path: 'docs/plan.md',
              selected_change_path: null,
              apply_result: null,
              generation_history: [
                {
                  id: 'gen-2',
                  created_at: '2026-03-23T09:15:00Z',
                  goal: 'Restored goal',
                  summary: 'Restored scaffold ready.',
                  artifact: RESTORED_ARTIFACT,
                },
              ],
            }),
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByRole('heading', { name: /generated plan/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /restore restored goal/i }))

    expect(screen.getByLabelText(/project goal/i)).toHaveValue('Restored goal')
    expect(screen.getByRole('button', { name: 'docs/plan.md' })).toBeInTheDocument()
    expect(screen.queryByText(/applied: 1/i)).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/session/restore-generation',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('keeps the current artifact visible when restoring history fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            selected_file_paths: ['README.md'],
            selected_change_paths: ['backend/app/main.py'],
            selected_file_path: 'README.md',
            selected_change_path: null,
            generation_history: [
              {
                id: 'gen-missing',
                created_at: '2026-03-23T09:15:00Z',
                goal: 'Broken restore target',
                summary: 'Old scaffold',
                artifact: RESTORED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: false,
          status: 404,
          body: {
            success: false,
            message: 'generation history entry not found',
            data: null,
            errors: ['generation history entry not found'],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByText(/mvp scaffold ready/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /restore broken restore target/i }))

    expect(await screen.findByText(/generation history entry not found/i)).toBeInTheDocument()
    expect(screen.getByText(/mvp scaffold ready/i)).toBeInTheDocument()
  })

  it('renders remove and clear controls for generation history entries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      ),
    )

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    expect(within(historyPanel).getByRole('button', { name: /remove first history entry/i })).toBeInTheDocument()
    expect(within(historyPanel).getByRole('button', { name: /clear history/i })).toBeInTheDocument()
  })

  it('shows saved time and file-change counts for each generation history entry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      ),
    )

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    expect(within(historyPanel).getByText(/saved 2026-03-23 09:00 utc/i)).toBeInTheDocument()
    expect(within(historyPanel).getByText(/2 files/i)).toBeInTheDocument()
    expect(within(historyPanel).getByText(/2 changes/i)).toBeInTheDocument()
  })

  it('shows an active badge and current state for the active generation entry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            active_generation_id: 'gen-1',
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      ),
    )

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    expect(within(historyPanel).getByText(/active/i)).toBeInTheDocument()
    expect(within(historyPanel).getByText(/^draft$/i)).toBeInTheDocument()
    expect(within(historyPanel).getByRole('button', { name: /current first history entry/i })).toBeDisabled()
  })

  it('expands a generation history preview when requested', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      ),
    )

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /preview first history entry/i }))

    const preview = within(historyPanel).getByRole('region', { name: /preview first history entry/i })
    expect(preview).toHaveTextContent(/frontend \+ backend split/i)
    expect(preview).toHaveTextContent(/project tree items: 2/i)
    expect(preview).toHaveTextContent(/placeholder provider response in use/i)
    expect(preview).toHaveTextContent(/review generated files/i)
  })

  it('keeps only one generation history preview open at a time', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
              {
                id: 'gen-2',
                created_at: '2026-03-23T09:05:00Z',
                goal: 'Second history entry',
                summary: 'Second summary',
                artifact: RESTORED_ARTIFACT,
              },
            ],
          }),
        ),
      ),
    )

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /preview first history entry/i }))
    expect(within(historyPanel).getByRole('region', { name: /preview first history entry/i })).toBeInTheDocument()

    await user.click(within(historyPanel).getByRole('button', { name: /preview second history entry/i }))

    expect(within(historyPanel).queryByRole('region', { name: /preview first history entry/i })).not.toBeInTheDocument()
    const secondPreview = within(historyPanel).getByRole('region', { name: /preview second history entry/i })
    expect(secondPreview).toBeInTheDocument()
    expect(within(secondPreview).getByText(/second summary/i)).toBeInTheDocument()
    expect(within(secondPreview).queryByText(/apply summary/i)).not.toBeInTheDocument()
  })

  it('shows apply summary metadata for a generation history entry when available', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-apply',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'Applied history entry',
                summary: 'Applied summary',
                artifact: GENERATED_ARTIFACT,
                apply_summary: {
                  validated_count: 4,
                  applied_count: 3,
                  applied_files_count: 2,
                  applied_changes_count: 1,
                  issue_count: 1,
                  error_count: 0,
                  last_applied_at: '2026-03-23T09:10:00Z',
                },
              },
            ],
          }),
        ),
      ),
    )

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    expect(within(historyPanel).getByText(/^needs attention$/i)).toBeInTheDocument()
    expect(within(historyPanel).getByText(/applied 3 items/i)).toBeInTheDocument()
    expect(
      within(historyPanel).getByText((content) => content.includes('2 files') && content.includes('1 changes')),
    ).toBeInTheDocument()
    expect(within(historyPanel).getByText(/1 issues/i)).toBeInTheDocument()

    await user.click(within(historyPanel).getByRole('button', { name: /preview applied history entry/i }))

    const preview = within(historyPanel).getByRole('region', { name: /preview applied history entry/i })
    expect(within(preview).getByText(/apply summary/i)).toBeInTheDocument()
    expect(within(preview).getByText(/validated: 4/i)).toBeInTheDocument()
    expect(within(preview).getByText(/applied: 3/i)).toBeInTheDocument()
    expect(within(preview).getByText(/files: 2/i)).toBeInTheDocument()
    expect(within(preview).getByText(/changes: 1/i)).toBeInTheDocument()
    expect(within(preview).getByText(/issues: 1/i)).toBeInTheDocument()
    expect(within(preview).getByText(/errors: 0/i)).toBeInTheDocument()
    expect(within(preview).getByText(/last applied: 2026-03-23 09:10 utc/i)).toBeInTheDocument()
  })

  it('shows an applied badge when a generation was applied cleanly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-clean',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'Clean apply entry',
                summary: 'Clean summary',
                artifact: GENERATED_ARTIFACT,
                apply_summary: {
                  validated_count: 3,
                  applied_count: 3,
                  applied_files_count: 2,
                  applied_changes_count: 1,
                  issue_count: 0,
                  error_count: 0,
                  last_applied_at: '2026-03-23T09:10:00Z',
                },
              },
            ],
          }),
        ),
      ),
    )

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    expect(within(historyPanel).getByText(/^applied$/i)).toBeInTheDocument()
    expect(within(historyPanel).queryByText(/^needs attention$/i)).not.toBeInTheDocument()
    expect(within(historyPanel).queryByText(/^draft$/i)).not.toBeInTheDocument()
  })

  it('moves the active badge after restoring a different generation', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            active_generation_id: 'gen-1',
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
              {
                id: 'gen-2',
                created_at: '2026-03-23T09:05:00Z',
                goal: 'Second history entry',
                summary: 'Second summary',
                artifact: RESTORED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation restored',
            data: buildSessionSnapshot({
              display_name: 'Wei',
              screen: 'workspace',
              workspace_path: 'D:/Codex/Trading assistant',
              goal: 'Second history entry',
              artifact: RESTORED_ARTIFACT,
              active_generation_id: 'gen-2',
              generation_history: [
                {
                  id: 'gen-1',
                  created_at: '2026-03-23T09:00:00Z',
                  goal: 'First history entry',
                  summary: 'First summary',
                  artifact: GENERATED_ARTIFACT,
                },
                {
                  id: 'gen-2',
                  created_at: '2026-03-23T09:05:00Z',
                  goal: 'Second history entry',
                  summary: 'Second summary',
                  artifact: RESTORED_ARTIFACT,
                },
              ],
              selected_file_paths: ['docs/plan.md'],
              selected_change_paths: [],
              selected_file_path: 'docs/plan.md',
              selected_change_path: null,
              apply_result: null,
            }),
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /restore second history entry/i }))

    const currentButton = within(historyPanel).getByRole('button', { name: /current second history entry/i })
    expect(currentButton).toBeDisabled()
    expect(within(historyPanel).getByText(/active/i)).toBeInTheDocument()
  })

  it('removes a single generation history entry from the panel', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
              {
                id: 'gen-2',
                created_at: '2026-03-23T09:05:00Z',
                goal: 'Second history entry',
                summary: 'Second summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation deleted',
            data: buildSessionSnapshot({
              display_name: 'Wei',
              screen: 'workspace',
              workspace_path: 'D:/Codex/Trading assistant',
              goal: 'Current goal',
              artifact: GENERATED_ARTIFACT,
              generation_history: [
                {
                  id: 'gen-2',
                  created_at: '2026-03-23T09:05:00Z',
                  goal: 'Second history entry',
                  summary: 'Second summary',
                  artifact: GENERATED_ARTIFACT,
                },
              ],
            }),
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /remove first history entry/i }))

    await waitFor(() => {
      expect(screen.queryByText(/first history entry/i)).not.toBeInTheDocument()
    })
    expect(screen.getByText(/second history entry/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/session/generations/gen-1',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('removes the active badge when deleting the active generation', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            active_generation_id: 'gen-1',
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation deleted',
            data: buildSessionSnapshot({
              display_name: 'Wei',
              screen: 'workspace',
              workspace_path: 'D:/Codex/Trading assistant',
              goal: 'Current goal',
              artifact: GENERATED_ARTIFACT,
              active_generation_id: null,
              generation_history: [],
            }),
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /remove first history entry/i }))

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /recent generations/i })).not.toBeInTheDocument()
    })
    expect(screen.queryByText(/active/i)).not.toBeInTheDocument()
  })

  it('preserves the active badge when deleting a different generation', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            active_generation_id: 'gen-2',
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'First history entry',
                summary: 'First summary',
                artifact: GENERATED_ARTIFACT,
              },
              {
                id: 'gen-2',
                created_at: '2026-03-23T09:05:00Z',
                goal: 'Second history entry',
                summary: 'Second summary',
                artifact: RESTORED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation deleted',
            data: buildSessionSnapshot({
              display_name: 'Wei',
              screen: 'workspace',
              workspace_path: 'D:/Codex/Trading assistant',
              goal: 'Current goal',
              artifact: RESTORED_ARTIFACT,
              active_generation_id: 'gen-2',
              generation_history: [
                {
                  id: 'gen-2',
                  created_at: '2026-03-23T09:05:00Z',
                  goal: 'Second history entry',
                  summary: 'Second summary',
                  artifact: RESTORED_ARTIFACT,
                },
              ],
            }),
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /remove first history entry/i }))

    await waitFor(() => {
      expect(screen.queryByText(/first history entry/i)).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /current second history entry/i })).toBeDisabled()
  })

  it('clears generation history and hides the history panel', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-1',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'Only history entry',
                summary: 'Only summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation history cleared',
            data: buildSessionSnapshot({
              display_name: 'Wei',
              screen: 'workspace',
              workspace_path: 'D:/Codex/Trading assistant',
              goal: 'Current goal',
              artifact: GENERATED_ARTIFACT,
              generation_history: [],
            }),
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /clear history/i }))

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /recent generations/i })).not.toBeInTheDocument()
    })
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/session/generations',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('keeps the history panel visible when deleting a generation fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            goal: 'Current goal',
            artifact: GENERATED_ARTIFACT,
            generation_history: [
              {
                id: 'gen-fail',
                created_at: '2026-03-23T09:00:00Z',
                goal: 'Failing history entry',
                summary: 'Failing summary',
                artifact: GENERATED_ARTIFACT,
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: false,
          status: 404,
          body: {
            success: false,
            message: 'generation history entry not found',
            data: null,
            errors: ['generation history entry not found'],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    const historyPanel = await screen.findByRole('region', { name: /recent generations/i })
    await user.click(within(historyPanel).getByRole('button', { name: /remove failing history entry/i }))

    expect(await screen.findByText(/generation history entry not found/i)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /recent generations/i })).toBeInTheDocument()
    expect(screen.getByText(/failing history entry/i)).toBeInTheDocument()
  })

  it('fills the workspace path from a recent workspace shortcut', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            recent_workspaces: ['D:/Codex/Trading assistant', 'D:/Projects/TradePilot'],
          }),
        ),
      ),
    )

    render(<App />)

    const workspaceInput = await screen.findByLabelText(/workspace path/i)
    await user.click(screen.getByRole('button', { name: /D:\/Projects\/TradePilot/i }))

    expect(workspaceInput).toHaveValue('D:/Projects/TradePilot')
  })

  it('stays on the login screen when no saved session exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(withSessionResponse()))

    render(<App />)

    expect(await screen.findByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/workspace path/i)).not.toBeInTheDocument()
  })

  it('logs in through the backend and shows the workspace form', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(withSessionResponse())
      .mockResolvedValueOnce(withLoginResponse())
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await logIn(user)

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(screen.getByRole('button', { name: /generate scaffold/i })).toBeDisabled()
  })

  it('shows the artifact panel after a successful generation', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(withSessionResponse())
        .mockResolvedValueOnce(withLoginResponse())
        .mockResolvedValueOnce(
          buildFetchResponse({
            ok: true,
            body: {
              success: true,
              message: 'generation complete',
              data: GENERATED_ARTIFACT,
              errors: [],
            },
          }),
        )
        .mockResolvedValueOnce(withGenerationSessionResponse()),
    )

    render(<App />)
    await logIn(user)
    await generateArtifact(user)

    expect(screen.getByText(/frontend \+ backend split/i)).toBeInTheDocument()
    expect(screen.getByText(/review generated files/i)).toBeInTheDocument()
  })

  it('loads the current file and shows a diff preview for rewrite changes', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(withSessionResponse())
      .mockResolvedValueOnce(withLoginResponse())
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation complete',
            data: GENERATED_ARTIFACT,
            errors: [],
          },
        }),
      )
      .mockResolvedValueOnce(withGenerationSessionResponse())
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'file loaded',
            data: {
              path: 'frontend/src/App.tsx',
              content: 'export function App() { return <div /> }',
            },
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await logIn(user)
    await generateArtifact(user)
    await user.click(screen.getByRole('button', { name: /change frontend\/src\/app.tsx/i }))

    expect(await screen.findByRole('region', { name: /rewrite diff preview/i })).toHaveTextContent(
      /-export function App\(\) \{ return <div \/> \}/,
    )
    expect(screen.getByRole('region', { name: /rewrite diff preview/i })).toHaveTextContent(
      /\+export function App\(\) \{ return <main \/> \}/,
    )
  })

  it('falls back to raw new content when rewrite preview loading fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(withSessionResponse())
      .mockResolvedValueOnce(withLoginResponse())
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation complete',
            data: GENERATED_ARTIFACT,
            errors: [],
          },
        }),
      )
      .mockResolvedValueOnce(withGenerationSessionResponse())
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: false,
          status: 404,
          body: {
            success: false,
            message: 'Target file does not exist.',
            data: null,
            errors: ['Target file does not exist.'],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await logIn(user)
    await generateArtifact(user)
    await user.click(screen.getByRole('button', { name: /change frontend\/src\/app.tsx/i }))

    expect(await screen.findByText(/current file preview unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/export function App\(\) \{ return <main \/> \}/i)).toBeInTheDocument()
  })

  it('selects all generated files by default after generation', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(withSessionResponse())
        .mockResolvedValueOnce(withLoginResponse())
        .mockResolvedValueOnce(
          buildFetchResponse({
            ok: true,
            body: {
              success: true,
              message: 'generation complete',
              data: GENERATED_ARTIFACT,
              errors: [],
            },
          }),
        )
        .mockResolvedValueOnce(withGenerationSessionResponse()),
    )

    render(<App />)
    await logIn(user)
    await generateArtifact(user)

    expect(screen.getByRole('checkbox', { name: 'README.md' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'backend/app/main.py' })).toBeChecked()
  })

  it('applies only the still-selected files and changes', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(withSessionResponse())
      .mockResolvedValueOnce(withLoginResponse())
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'generation complete',
            data: GENERATED_ARTIFACT,
            errors: [],
          },
        }),
      )
      .mockResolvedValueOnce(withGenerationSessionResponse())
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'files applied',
            data: {
              validated: ['backend/app/main.py'],
              applied: ['backend/app/main.py'],
              applied_files: ['backend/app/main.py'],
              applied_changes: ['backend/app/main.py'],
              skipped: [],
              issues: [],
              errors: [],
            },
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await logIn(user)
    await generateArtifact(user)

    await user.click(screen.getByRole('checkbox', { name: /README.md/i }))
    await user.click(screen.getByRole('checkbox', { name: /change frontend\/src\/app.tsx/i }))
    await user.click(screen.getByRole('button', { name: /apply selected files/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(5)
    })

    const applyRequest = JSON.parse(fetchMock.mock.calls[4][1]?.body as string)
    expect(applyRequest.files).toHaveLength(1)
    expect(applyRequest.files[0].path).toBe('backend/app/main.py')
    expect(applyRequest.changes).toHaveLength(1)
    expect(applyRequest.changes[0].path).toBe('backend/app/main.py')
  })

  it('shows the apply result summary after files are applied', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(withSessionResponse())
        .mockResolvedValueOnce(withLoginResponse())
        .mockResolvedValueOnce(
          buildFetchResponse({
            ok: true,
            body: {
              success: true,
              message: 'generation complete',
              data: GENERATED_ARTIFACT,
              errors: [],
            },
          }),
        )
        .mockResolvedValueOnce(withGenerationSessionResponse())
        .mockResolvedValueOnce(
          buildFetchResponse({
            ok: true,
            body: {
              success: true,
              message: 'files applied',
              data: {
                validated: ['README.md'],
                applied: ['README.md'],
                applied_files: ['README.md'],
                applied_changes: [],
                skipped: ['backend/app/main.py'],
                issues: [
                  {
                    path: 'backend/app/main.py',
                    stage: 'validation',
                    kind: 'snippet_not_found',
                    message: 'Generated patch no longer matches the current file content.',
                    suggestion: 'Regenerate this change or preview the latest file state before applying again.',
                  },
                ],
                errors: [],
              },
              errors: [],
            },
          }),
        ),
    )

    render(<App />)
    await logIn(user)
    await generateArtifact(user)
    await user.click(screen.getByRole('button', { name: /apply selected files/i }))

    expect(await screen.findByText(/applied: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/validated: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/skipped: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/issues: 1/i)).toBeInTheDocument()
    const issueItem = screen.getByText(/generated patch no longer matches the current file content/i).closest('li')
    expect(issueItem).not.toBeNull()
    const issueScope = within(issueItem as HTMLElement)
    expect(issueScope.getByText(/backend\/app\/main.py/i)).toBeInTheDocument()
    expect(issueScope.getByText(/regenerate this change or preview the latest file state before applying again/i)).toBeInTheDocument()
  })

  it('shows setup guidance when the openai api key is missing', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(withSessionResponse())
        .mockResolvedValueOnce(withLoginResponse())
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({
            success: false,
            message: 'OPENAI_API_KEY is required for the OpenAI provider',
            data: null,
            errors: ['missing key'],
          }),
        }),
    )

    render(<App />)
    await logIn(user)
    await user.type(screen.getByLabelText(/workspace path/i), 'D:/Codex/Trading assistant')
    await user.type(screen.getByLabelText(/project goal/i), 'Build a stock trading system MVP')
    await user.click(screen.getByRole('button', { name: /generate scaffold/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /connect openai/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/set your openai api key in powershell before generating/i)).toBeInTheDocument()
    expect(screen.getByText('$env:OPENAI_API_KEY=\"your_api_key_here\"')).toBeInTheDocument()
    expect(screen.getByText(/after setting the key, click generate scaffold again/i)).toBeInTheDocument()
  })

  it('clears the saved session and returns to the login screen', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        withSessionResponse(
          buildSessionSnapshot({
            display_name: 'Wei',
            screen: 'workspace',
            workspace_path: 'D:/Codex/Trading assistant',
            recent_workspaces: ['D:/Codex/Trading assistant'],
            goal: 'Continue refining the trading assistant',
            artifact: GENERATED_ARTIFACT,
          }),
        ),
      )
      .mockResolvedValueOnce(
        buildFetchResponse({
          ok: true,
          body: {
            success: true,
            message: 'session cleared',
            data: EMPTY_SESSION,
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    expect(await screen.findByRole('heading', { name: /generated plan/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear saved session/i }))

    expect(await screen.findByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /generated plan/i })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/session',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })
})
