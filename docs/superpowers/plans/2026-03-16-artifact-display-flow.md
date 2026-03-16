# Artifact Display Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the full generation artifact in the frontend so users can inspect summary, architecture, files, warnings, and next steps after a successful generation request.

**Architecture:** Keep `WorkspacePanel` focused on input and actions, keep `ArtifactPanel` focused on result rendering, and let `App.tsx` coordinate API state plus selected-file preview state. Reuse the existing backend artifact schema and keep this slice presentation-only, without adding file-apply behavior yet.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library.

---

## File Structure Map

### Frontend State and Composition

- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/defaults.ts`
- Modify: `frontend/src/lib/api.ts`

### UI Components

- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/components/ArtifactPanel.tsx`
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
- Modify: `frontend/src/components/FilePreview.tsx`

### Styling

- Modify: `frontend/src/styles.css`

### Responsibility Notes

- `frontend/src/App.tsx`: owns artifact state, selected file preview state, and generation result wiring.
- `frontend/src/components/WorkspacePanel.tsx`: remains input-only and should not render the full artifact.
- `frontend/src/components/ArtifactPanel.tsx`: renders the artifact sections in a stable layout.
- `frontend/src/components/FilePreview.tsx`: displays the currently selected file content only.
- `frontend/src/lib/types.ts`: defines the artifact and preview-related frontend types.

## Chunk 1: Artifact Rendering Shell

### Task 1: Show the complete artifact after a successful generation

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/components/ArtifactPanel.tsx`
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Write the failing frontend test for successful artifact rendering**

```tsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `Set-Location frontend; cmd /c npm run test -- --run src/App.test.tsx`
Expected: FAIL because the current UI only shows the artifact summary and does not render the full artifact panel after generation.

- [ ] **Step 3: Implement the minimal composition changes in `App.tsx` and `WorkspacePanel.tsx`**

```tsx
{screen === 'workspace' ? (
  <section className="workspace-layout">
    <WorkspacePanel ... />
    {artifact ? <ArtifactPanel artifact={artifact} ... /> : null}
  </section>
) : (
  <LoginShell ... />
)}
```

```tsx
export function WorkspacePanel(...) {
  return (
    <section className="panel workspace-panel">
      {/* inputs, generate button, error message only */}
    </section>
  )
}
```

- [ ] **Step 4: Implement the minimal artifact section rendering in `ArtifactPanel.tsx`**

```tsx
<section className="panel artifact-panel">
  <h2>Generated Plan</h2>
  <p>{artifact.summary}</p>
  <section>
    <h3>Architecture</h3>
    <p>{artifact.architecture}</p>
  </section>
  <section>
    <h3>Project Tree</h3>
    <ul>{artifact.project_tree.map(...)}</ul>
  </section>
  <section>
    <h3>Next Steps</h3>
    <ul>{artifact.next_steps.map(...)}</ul>
  </section>
</section>
```

- [ ] **Step 5: Run the updated test to verify it passes**

Run: `Set-Location frontend; cmd /c npm run test -- --run src/App.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/components/WorkspacePanel.tsx frontend/src/components/ArtifactPanel.tsx frontend/src/lib/types.ts frontend/src/styles.css
git commit -m "feat: render artifact results after generation"
```

## Chunk 2: File Preview Selection

### Task 2: Support previewing different generated files

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/ArtifactPanel.tsx`
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
- Modify: `frontend/src/components/FilePreview.tsx`
- Modify: `frontend/src/lib/types.ts`

- [ ] **Step 1: Write the failing artifact-panel test for file preview switching**

```tsx
it('switches the file preview when a different file is selected', async () => {
  const user = userEvent.setup()
  render(
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
      onSelectFile={() => {}}
    />,
  )

  expect(screen.getByText('# Demo')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /backend\/app\/main.py/i }))
  expect(screen.getByText('print("hello")')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `Set-Location frontend; cmd /c npm run test -- --run src/components/ArtifactPanel.test.tsx`
Expected: FAIL because the current artifact panel does not manage or expose selected-file preview switching.

- [ ] **Step 3: Add explicit preview-selection state in `App.tsx`**

```tsx
const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)

useEffect(() => {
  if (artifact?.files.length) {
    setSelectedFilePath(artifact.files[0].path)
  }
}, [artifact])
```

- [ ] **Step 4: Update `ArtifactPanel.tsx` and `FilePreview.tsx` to render and switch previews**

```tsx
const selectedFile = artifact.files.find((file) => file.path === selectedFilePath) ?? artifact.files[0]

{artifact.files.map((file) => (
  <button key={file.path} type="button" onClick={() => onSelectFile(file.path)}>
    {file.path}
  </button>
))}

<FilePreview file={selectedFile} />
```

- [ ] **Step 5: Run the targeted test to verify it passes**

Run: `Set-Location frontend; cmd /c npm run test -- --run src/components/ArtifactPanel.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/ArtifactPanel.tsx frontend/src/components/ArtifactPanel.test.tsx frontend/src/components/FilePreview.tsx frontend/src/lib/types.ts
git commit -m "feat: add artifact file preview switching"
```

## Chunk 3: Regression Verification and Layout Polish

### Task 3: Keep error handling intact and make the artifact layout readable

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/styles.css`
- Test: `frontend/src/components/ArtifactPanel.test.tsx`
- Test: `frontend/src/App.test.tsx`

- [ ] **Step 1: Confirm the existing error-handling test still exists and still asserts readable backend errors**

```tsx
expect(await screen.findByText(/openai_api_key is required/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run the full frontend suite to surface any regressions**

Run: `Set-Location frontend; cmd /c npm run test -- --run`
Expected: PASS or FAIL with layout/composition regressions introduced by the new artifact panel wiring.

- [ ] **Step 3: Make the minimal CSS updates for a two-area layout**

```css
.workspace-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(20rem, 28rem) minmax(0, 1fr);
  align-items: start;
}

.artifact-panel {
  display: grid;
  gap: 1rem;
}

.file-list {
  display: grid;
  gap: 0.5rem;
}
```

- [ ] **Step 4: Run the full frontend suite again to verify everything passes**

Run: `Set-Location frontend; cmd /c npm run test -- --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.test.tsx frontend/src/styles.css frontend/src/components/ArtifactPanel.test.tsx
git commit -m "style: polish artifact display layout"
```

## Execution Notes

- Use strict TDD order for each task: failing test first, verify the failure, then minimum code to pass.
- Do not add file-apply buttons or backend write calls in this slice.
- Keep `WorkspacePanel` focused on inputs and status messages; do not move artifact rendering back into it.
- If an implementation detail tempts you to add markdown rendering or code-editor behavior, skip it and keep the plain-text rendering defined in the spec.
