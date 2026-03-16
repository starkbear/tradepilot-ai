import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArtifactPanel } from './ArtifactPanel'

describe('ArtifactPanel', () => {
  it('lets the user preview files and deselect one before apply', async () => {
    const user = userEvent.setup()

    render(
      <ArtifactPanel
        artifact={{
          summary: 'ready',
          architecture: 'split app',
          project_tree: ['frontend/', 'backend/'],
          files: [
            { path: 'README.md', purpose: 'docs', content: '# Demo', selected: true },
            { path: 'notes.txt', purpose: 'notes', content: 'skip', selected: true },
          ],
          warnings: [],
          next_steps: [],
        }}
        onToggleFile={() => {}}
        onApply={() => {}}
      />,
    )

    expect(screen.getByText('README.md')).toBeInTheDocument()
    await user.click(screen.getByLabelText(/notes.txt/i))
    expect(screen.getByRole('button', { name: /apply selected files/i })).toBeInTheDocument()
  })
})
