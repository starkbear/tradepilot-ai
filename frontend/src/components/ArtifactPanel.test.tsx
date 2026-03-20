import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArtifactPanel } from './ArtifactPanel'

const ARTIFACT_WITH_CHANGES = {
  summary: 'ready',
  architecture: 'split app',
  project_tree: ['frontend/', 'backend/'],
  files: [
    { path: 'README.md', purpose: 'docs', content: '# Demo', selected: true },
    { path: 'backend/app/main.py', purpose: 'backend entry', content: 'print("hello")', selected: true },
  ],
  changes: [
    {
      path: 'backend/app/main.py',
      mode: 'patch',
      reason: 'Register the router.',
      old_snippet: 'app = FastAPI()\n',
      new_content: 'app = FastAPI()\napp.include_router(router)\n',
      selected: true,
      replace_all_matches: false,
    },
    {
      path: 'frontend/src/App.tsx',
      mode: 'rewrite',
      reason: 'Replace the app shell.',
      new_content: 'export function App() { return <main /> }',
      selected: true,
      old_snippet: null,
      replace_all_matches: false,
    },
  ],
  warnings: [],
  next_steps: [],
}

describe('ArtifactPanel', () => {
  it('switches the file preview when a different file is selected', async () => {
    const user = userEvent.setup()
    const onSelectFile = vi.fn()
    const onToggleFile = vi.fn()
    const onSelectChange = vi.fn()
    const onToggleChange = vi.fn()
    const onApplySelected = vi.fn()

    const { rerender } = render(
      <ArtifactPanel
        artifact={ARTIFACT_WITH_CHANGES}
        selectedFilePath="README.md"
        selectedFilePaths={['README.md', 'backend/app/main.py']}
        selectedChangePath={null}
        selectedChangePaths={['backend/app/main.py', 'frontend/src/App.tsx']}
        isApplying={false}
        applyResult={null}
        applyErrorMessage={null}
        onSelectFile={onSelectFile}
        onToggleFile={onToggleFile}
        onSelectChange={onSelectChange}
        onToggleChange={onToggleChange}
        onApplySelected={onApplySelected}
      />,
    )

    expect(screen.getByText('# Demo')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^backend\/app\/main.py$/i }))
    expect(onSelectFile).toHaveBeenCalledWith('backend/app/main.py')

    rerender(
      <ArtifactPanel
        artifact={ARTIFACT_WITH_CHANGES}
        selectedFilePath="backend/app/main.py"
        selectedFilePaths={['README.md', 'backend/app/main.py']}
        selectedChangePath={null}
        selectedChangePaths={['backend/app/main.py', 'frontend/src/App.tsx']}
        isApplying={false}
        applyResult={null}
        applyErrorMessage={null}
        onSelectFile={onSelectFile}
        onToggleFile={onToggleFile}
        onSelectChange={onSelectChange}
        onToggleChange={onToggleChange}
        onApplySelected={onApplySelected}
      />,
    )

    expect(screen.getByText('print("hello")')).toBeInTheDocument()
  })

  it('renders existing file changes and previews patch and rewrite drafts', async () => {
    const user = userEvent.setup()
    const onSelectFile = vi.fn()
    const onToggleFile = vi.fn()
    const onSelectChange = vi.fn()
    const onToggleChange = vi.fn()
    const onApplySelected = vi.fn()

    const { rerender } = render(
      <ArtifactPanel
        artifact={ARTIFACT_WITH_CHANGES}
        selectedFilePath="README.md"
        selectedFilePaths={['README.md', 'backend/app/main.py']}
        selectedChangePath={null}
        selectedChangePaths={['backend/app/main.py', 'frontend/src/App.tsx']}
        isApplying={false}
        applyResult={null}
        applyErrorMessage={null}
        onSelectFile={onSelectFile}
        onToggleFile={onToggleFile}
        onSelectChange={onSelectChange}
        onToggleChange={onToggleChange}
        onApplySelected={onApplySelected}
      />,
    )

    expect(screen.getByRole('heading', { name: /existing file changes/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /change backend\/app\/main.py/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /change frontend\/src\/app.tsx/i })).toBeChecked()

    await user.click(screen.getByRole('button', { name: /change backend\/app\/main.py/i }))
    expect(onSelectChange).toHaveBeenCalledWith('backend/app/main.py')

    rerender(
      <ArtifactPanel
        artifact={ARTIFACT_WITH_CHANGES}
        selectedFilePath="README.md"
        selectedFilePaths={['README.md', 'backend/app/main.py']}
        selectedChangePath="backend/app/main.py"
        selectedChangePaths={['backend/app/main.py', 'frontend/src/App.tsx']}
        isApplying={false}
        applyResult={null}
        applyErrorMessage={null}
        onSelectFile={onSelectFile}
        onToggleFile={onToggleFile}
        onSelectChange={onSelectChange}
        onToggleChange={onToggleChange}
        onApplySelected={onApplySelected}
      />,
    )

    const patchPreview = screen.getByText(/change preview/i).closest('article')
    expect(patchPreview).not.toBeNull()
    const patchPreviewScope = within(patchPreview as HTMLElement)
    expect(patchPreviewScope.getByText(/register the router/i)).toBeInTheDocument()
    expect(patchPreviewScope.getByText(/mode: patch/i)).toBeInTheDocument()
    expect(patchPreviewScope.getByRole('region', { name: /patch diff preview/i })).toHaveTextContent(/app = FastAPI\(\)/)
    expect(patchPreviewScope.getByRole('region', { name: /patch diff preview/i })).toHaveTextContent(/\+app\.include_router\(router\)/)
    expect(patchPreviewScope.queryByRole('heading', { name: /current snippet/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /change frontend\/src\/app.tsx/i }))
    expect(onSelectChange).toHaveBeenCalledWith('frontend/src/App.tsx')

    rerender(
      <ArtifactPanel
        artifact={ARTIFACT_WITH_CHANGES}
        selectedFilePath="README.md"
        selectedFilePaths={['README.md', 'backend/app/main.py']}
        selectedChangePath="frontend/src/App.tsx"
        selectedChangePaths={['backend/app/main.py', 'frontend/src/App.tsx']}
        isApplying={false}
        applyResult={null}
        applyErrorMessage={null}
        onSelectFile={onSelectFile}
        onToggleFile={onToggleFile}
        onSelectChange={onSelectChange}
        onToggleChange={onToggleChange}
        onApplySelected={onApplySelected}
      />,
    )

    const rewritePreview = screen.getByText(/change preview/i).closest('article')
    expect(rewritePreview).not.toBeNull()
    const rewritePreviewScope = within(rewritePreview as HTMLElement)
    expect(rewritePreviewScope.getByText(/replace the app shell/i)).toBeInTheDocument()
    expect(rewritePreviewScope.getByText(/export function App\(\) \{ return <main \/> \}/i)).toBeInTheDocument()
  })
})
