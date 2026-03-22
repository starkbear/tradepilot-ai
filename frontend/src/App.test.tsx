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

const EMPTY_SESSION = {
  display_name: '',
  recent_workspaces: [],
  preferred_provider: 'openai',
  screen: 'login',
  workspace_path: '',
  goal: '',
  artifact: null,
  selected_file_paths: [],
  selected_change_paths: [],
  selected_file_path: null,
  selected_change_path: null,
  apply_result: null,
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
        }),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByLabelText(/workspace path/i)).toHaveValue('D:/Codex/Trading assistant')
    expect(screen.getByLabelText(/project goal/i)).toHaveValue('Continue refining the trading assistant')
    expect(screen.getByRole('heading', { name: /generated plan/i })).toBeInTheDocument()
    expect(screen.getByText(/applied: 1/i)).toBeInTheDocument()
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
        ),
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
        ),
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
      expect(fetchMock).toHaveBeenCalledTimes(4)
    })

    const applyRequest = JSON.parse(fetchMock.mock.calls[3][1]?.body as string)
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
})
