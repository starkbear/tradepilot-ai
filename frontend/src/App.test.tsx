import { render, screen, waitFor } from '@testing-library/react'
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
  warnings: ['Placeholder provider response in use.'],
  next_steps: ['Review generated files'],
}

function buildFetchResponse({ ok, status = 200, body }: { ok: boolean; status?: number; body: unknown }) {
  return {
    ok,
    status,
    json: async () => body,
  }
}

async function generateArtifact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/display name/i), 'Wei')
  await user.click(screen.getByRole('button', { name: /enter workspace/i }))
  await user.type(screen.getByLabelText(/workspace path/i), 'D:/Codex/Trading assistant')
  await user.type(screen.getByLabelText(/project goal/i), 'Build a stock trading system MVP')
  await user.click(screen.getByRole('button', { name: /generate scaffold/i }))
  await screen.findByRole('heading', { name: /generated plan/i })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('lets the user log in locally and see the workspace form', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/display name/i), 'Wei')
    await user.click(screen.getByRole('button', { name: /enter workspace/i }))

    expect(screen.getByLabelText(/workspace path/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate scaffold/i })).toBeDisabled()
  })

  it('shows the artifact panel after a successful generation', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
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
    await generateArtifact(user)

    expect(screen.getByText(/frontend \+ backend split/i)).toBeInTheDocument()
    expect(screen.getByText(/review generated files/i)).toBeInTheDocument()
  })

  it('selects all generated files by default after generation', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
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
    await generateArtifact(user)

    expect(screen.getByRole('checkbox', { name: /README.md/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /backend\/app\/main.py/i })).toBeChecked()
  })

  it('applies only the still-selected files', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
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
              applied: ['backend/app/main.py'],
              skipped: [],
              errors: [],
            },
            errors: [],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await generateArtifact(user)

    await user.click(screen.getByRole('checkbox', { name: /README.md/i }))
    await user.click(screen.getByRole('button', { name: /apply selected files/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const applyRequest = JSON.parse(fetchMock.mock.calls[1][1]?.body as string)
    expect(applyRequest.files).toHaveLength(1)
    expect(applyRequest.files[0].path).toBe('backend/app/main.py')
  })

  it('shows the apply result summary after files are applied', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn()
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
                applied: ['README.md'],
                skipped: ['backend/app/main.py'],
                errors: ['Could not write config/local.env'],
              },
              errors: [],
            },
          }),
        ),
    )

    render(<App />)
    await generateArtifact(user)
    await user.click(screen.getByRole('button', { name: /apply selected files/i }))

    expect(await screen.findByText(/applied: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/skipped: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/errors: 1/i)).toBeInTheDocument()
  })

  it('shows setup guidance when the openai api key is missing', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
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

    await user.type(screen.getByLabelText(/display name/i), 'Wei')
    await user.click(screen.getByRole('button', { name: /enter workspace/i }))
    await user.type(screen.getByLabelText(/workspace path/i), 'D:/Codex/Trading assistant')
    await user.type(screen.getByLabelText(/project goal/i), 'Build a stock trading system MVP')
    await user.click(screen.getByRole('button', { name: /generate scaffold/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /connect openai/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/set your openai api key in powershell before generating/i)).toBeInTheDocument()
    expect(screen.getByText('$env:OPENAI_API_KEY="your_api_key_here"')).toBeInTheDocument()
    expect(screen.getByText(/after setting the key, click generate scaffold again/i)).toBeInTheDocument()
  })
})
