import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArtifactPanel } from './ArtifactPanel'

describe('ArtifactPanel', () => {
  it('switches the file preview when a different file is selected', async () => {
    const user = userEvent.setup()
    const onSelectFile = vi.fn()

    const { rerender } = render(
      <ArtifactPanel
        artifact={{
          summary: 'ready',
          architecture: 'split app',
          project_tree: ['frontend/', 'backend/'],
          files: [
            { path: 'README.md', purpose: 'docs', content: '# Demo', selected: true },
            { path: 'backend/app/main.py', purpose: 'backend entry', content: 'print("hello")', selected: true },
          ],
          warnings: [],
          next_steps: [],
        }}
        selectedFilePath="README.md"
        onSelectFile={onSelectFile}
      />,
    )

    expect(screen.getByText('# Demo')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /backend\/app\/main.py/i }))
    expect(onSelectFile).toHaveBeenCalledWith('backend/app/main.py')

    rerender(
      <ArtifactPanel
        artifact={{
          summary: 'ready',
          architecture: 'split app',
          project_tree: ['frontend/', 'backend/'],
          files: [
            { path: 'README.md', purpose: 'docs', content: '# Demo', selected: true },
            { path: 'backend/app/main.py', purpose: 'backend entry', content: 'print("hello")', selected: true },
          ],
          warnings: [],
          next_steps: [],
        }}
        selectedFilePath="backend/app/main.py"
        onSelectFile={onSelectFile}
      />,
    )

    expect(screen.getByText('print("hello")')).toBeInTheDocument()
  })
})
