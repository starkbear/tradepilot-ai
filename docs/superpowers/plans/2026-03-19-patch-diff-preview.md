# Patch Diff Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight unified diff preview for `patch`-mode existing file changes so users can review generated modifications more clearly before applying them.

**Architecture:** Keep the change-preview flow frontend-only. Introduce a focused `PatchDiffPreview` component that computes a small unified diff from `old_snippet` and `new_content`, then let `ChangePreview` dispatch between patch diff rendering and the existing rewrite full-content rendering.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library

---

## File Map

- Create: `frontend/src/components/PatchDiffPreview.tsx`
  - Renders a unified diff-style block for short patch snippets.
- Create: `frontend/src/components/PatchDiffPreview.test.tsx`
  - Covers insertion, deletion, and full-replacement rendering.
- Modify: `frontend/src/components/ChangePreview.tsx`
  - Routes `patch` changes to `PatchDiffPreview` and keeps `rewrite` behavior intact.
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
  - Updates the existing preview regression test to assert diff-style rendering.
- Optional modify: `frontend/src/App.test.tsx`
  - Only if preview copy changes ripple into higher-level assertions.

## Chunk 1: Diff Preview Component

### Task 1: Add focused tests for unified diff rendering

**Files:**
- Create: `frontend/src/components/PatchDiffPreview.test.tsx`

- [ ] **Step 1: Write the failing test for a line insertion**

```tsx
import { render, screen } from '@testing-library/react'
import { PatchDiffPreview } from './PatchDiffPreview'

it('renders unchanged and added lines for a simple insertion', () => {
  render(
    <PatchDiffPreview
      oldSnippet={'app = FastAPI()\n'}
      newContent={'app = FastAPI()\napp.include_router(router)\n'}
    />,
  )

  expect(screen.getByText(' app = FastAPI()')).toBeInTheDocument()
  expect(screen.getByText('+app.include_router(router)')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c npm run test -- --run src/components/PatchDiffPreview.test.tsx`
Expected: FAIL because `PatchDiffPreview` does not exist yet.

- [ ] **Step 3: Extend the test file for deletion and full replacement**

```tsx
it('renders removed lines when content is deleted', () => {
  render(
    <PatchDiffPreview
      oldSnippet={'line one\nline two\n'}
      newContent={'line one\n'}
    />,
  )

  expect(screen.getByText(' line one')).toBeInTheDocument()
  expect(screen.getByText('-line two')).toBeInTheDocument()
})

it('renders removed and added lines when there is no shared context', () => {
  render(
    <PatchDiffPreview
      oldSnippet={'old line\n'}
      newContent={'new line\n'}
    />,
  )

  expect(screen.getByText('-old line')).toBeInTheDocument()
  expect(screen.getByText('+new line')).toBeInTheDocument()
})
```

- [ ] **Step 4: Implement the minimal component**

Create `frontend/src/components/PatchDiffPreview.tsx` with:
- A helper that splits both strings into lines.
- Common-prefix detection.
- Common-suffix detection.
- Rendering of:
  - unchanged prefix lines with `' '` prefix
  - removed middle lines with `'-'`
  - added middle lines with `'+'`
  - unchanged suffix lines with `' '` prefix
- A single `<pre>` output block wrapped in a small semantic container.

Use a narrow API:

```tsx
type PatchDiffPreviewProps = {
  oldSnippet: string | null
  newContent: string
}
```

- [ ] **Step 5: Run the focused diff tests**

Run: `cmd /c npm run test -- --run src/components/PatchDiffPreview.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit the diff component slice**

```bash
git add frontend/src/components/PatchDiffPreview.tsx frontend/src/components/PatchDiffPreview.test.tsx
git commit -m "feat: add patch diff preview component"
```

## Chunk 2: Integrate Patch Preview Into Change Preview

### Task 2: Route patch-mode changes through the new diff component

**Files:**
- Modify: `frontend/src/components/ChangePreview.tsx`
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
- Optional modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing integration expectations in `ArtifactPanel.test.tsx`**

Update the patch-preview assertions so they look for diff-style lines instead of the old raw snippet sections. For the existing patch test case, assert output such as:

```tsx
expect(patchPreviewScope.getByText(' app = FastAPI()')).toBeInTheDocument()
expect(patchPreviewScope.getByText('+app.include_router(router)')).toBeInTheDocument()
expect(patchPreviewScope.queryByRole('heading', { name: /current snippet/i })).not.toBeInTheDocument()
```

Keep the rewrite assertions unchanged so the test still proves rewrite mode uses full-content preview.

- [ ] **Step 2: Run the focused integration test to verify it fails**

Run: `cmd /c npm run test -- --run src/components/ArtifactPanel.test.tsx`
Expected: FAIL because `ChangePreview` still renders the old snippet/new content layout for patches.

- [ ] **Step 3: Implement the minimal `ChangePreview` integration**

Update `frontend/src/components/ChangePreview.tsx` to:
- Import `PatchDiffPreview`.
- Keep the summary fields (`Change Preview`, path, reason, mode).
- For `change.mode === 'patch'`, render:

```tsx
<PatchDiffPreview oldSnippet={change.old_snippet} newContent={change.new_content} />
```

- For `change.mode === 'rewrite'`, keep the current `New Content` heading and `<pre>` block.
- Remove the old patch-only `Current Snippet` block.

- [ ] **Step 4: Run focused frontend regression tests**

Run: `cmd /c npm run test -- --run src/components/PatchDiffPreview.test.tsx src/components/ArtifactPanel.test.tsx src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full project test suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend tests PASS and frontend tests PASS with the new diff preview coverage included.

- [ ] **Step 6: Commit the integration slice**

```bash
git add frontend/src/components/ChangePreview.tsx frontend/src/components/ArtifactPanel.test.tsx frontend/src/components/PatchDiffPreview.tsx frontend/src/components/PatchDiffPreview.test.tsx frontend/src/App.test.tsx
git commit -m "feat: show patch diffs in change preview"
```

## Notes for the Implementer

- Keep the diff algorithm intentionally small. This feature is for short AI-generated snippet review, not full patch-file generation.
- Do not add a new dependency for diff rendering.
- Do not change backend models, API envelopes, or apply logic.
- If `oldSnippet` is `null`, treat the preview as added lines only.
- If `newContent` is empty, render removed lines only.
- If `ArtifactPanel.test.tsx` covers the new behavior cleanly, avoid adding redundant higher-level assertions to `App.test.tsx`.

## Verification Checklist

Before calling the work complete, confirm all of the following:

- `PatchDiffPreview` exists and has dedicated tests.
- `patch` change previews render diff-style output.
- `rewrite` change previews still render full replacement content.
- Existing artifact selection and apply-flow tests still pass.
- `powershell -ExecutionPolicy Bypass -File scripts/test.ps1` passes in the worktree.
