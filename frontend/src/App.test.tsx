import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

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
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'generation complete',
          data: {
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
          },
          errors: [],
        }),
      }),
    )

    render(<App />)

    await user.type(screen.getByLabelText(/display name/i), 'Wei')
    await user.click(screen.getByRole('button', { name: /enter workspace/i }))
    await user.type(screen.getByLabelText(/workspace path/i), 'D:/Codex/Trading assistant')
    await user.type(screen.getByLabelText(/project goal/i), 'Build a stock trading system MVP')
    await user.click(screen.getByRole('button', { name: /generate scaffold/i }))

    expect(await screen.findByRole('heading', { name: /generated plan/i })).toBeInTheDocument()
    expect(screen.getByText(/frontend \+ backend split/i)).toBeInTheDocument()
    expect(screen.getByText(/review generated files/i)).toBeInTheDocument()
  })

  it('shows a readable error when generation fails', async () => {
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
      expect(screen.getByText(/openai_api_key is required/i)).toBeInTheDocument()
    })
  })
})
