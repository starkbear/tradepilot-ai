# Generation History Open Current Path Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users jump from a history comparison path directly into the current artifact preview.

**Architecture:** Keep the change frontend-only. `GenerationHistoryEntryPreview` will classify visible comparison paths against the current artifact and surface `Open in Current` buttons. A new callback will be threaded through `GenerationHistoryPanel` and `WorkspacePanel` into `App`, where the existing current-file/current-change selection state will be updated and a workspace feedback message will be shown.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## File Map

- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
  - Add path classification and `Open in Current` actions.
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
  - Thread the new callback to preview entries.
- Modify: `frontend/src/components/WorkspacePanel.tsx`
  - Pass the new callback through existing props.
- Modify: `frontend/src/App.tsx`
  - Implement the callback using existing artifact preview selection state and history action messaging.
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
  - Add tests for matching file/change actions and callback payloads.
- Modify: `frontend/src/components/GenerationHistoryPanel.test.tsx`
  - Verify callback wiring reaches expanded preview entries.
- Modify: `frontend/src/App.test.tsx`
  - Verify clicking `Open in Current` selects the correct current artifact preview and shows feedback.

## Chunk 1: Preview-Level Open Actions

### Task 1: Add failing preview tests for file and change jumps

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Write failing tests for file and change path actions**
  - Add one test that expects `Open in Current` beside a matching current file path and verifies the callback receives `{ path, kind: 'file' }`.
  - Add one test that expects `Open in Current` beside a matching current change path and verifies the callback receives `{ path, kind: 'change' }`.
  - Add one test that confirms preview-only paths without a current match do not show the button.

- [ ] **Step 2: Run the preview tests to verify they fail**

Run: `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx`
Expected: FAIL because the preview component does not yet accept or use the callback.

- [ ] **Step 3: Implement minimal preview support**
  - Add an optional callback prop such as `onOpenCurrentArtifactPath`.
  - Add a helper that classifies a visible path as `file`, `change`, or unavailable using `currentArtifact`.
  - Render `Open in Current` only for matched visible paths.

- [ ] **Step 4: Re-run the preview tests**

Run: `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit preview support**

```bash
git add frontend/src/components/GenerationHistoryEntryPreview.tsx frontend/src/components/GenerationHistoryEntryPreview.test.tsx
git commit -m "feat: add history preview open current actions"
```

## Chunk 2: Thread the Callback Through the History Stack

### Task 2: Add failing panel wiring test

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`

- [ ] **Step 1: Write a failing panel test for callback wiring**
  - Expand a history entry with a current artifact.
  - Click `Open in Current` from the preview.
  - Assert the callback passed into `GenerationHistoryPanel` is invoked with the expected payload.

- [ ] **Step 2: Run the panel test to verify it fails**

Run: `cmd /c npm run test -- --run src/components/GenerationHistoryPanel.test.tsx`
Expected: FAIL because the callback is not yet threaded through.

- [ ] **Step 3: Implement the callback plumbing**
  - Add the callback prop to `GenerationHistoryPanel` and `WorkspacePanel`.
  - Pass it through to `GenerationHistoryEntryPreview`.

- [ ] **Step 4: Re-run the panel test**

Run: `cmd /c npm run test -- --run src/components/GenerationHistoryPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit the panel wiring**

```bash
git add frontend/src/components/GenerationHistoryPanel.tsx frontend/src/components/WorkspacePanel.tsx frontend/src/components/GenerationHistoryPanel.test.tsx
git commit -m "feat: wire history open current callback"
```

## Chunk 3: Integrate With App Selection State

### Task 3: Add failing app-level integration test

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Write a failing app test for opening current paths**
  - Seed the app with a current artifact and one historical preview entry.
  - Click `Open in Current` for a file path and verify the current file preview becomes active.
  - Verify a feedback message like `Opened current file "...".` appears.
  - Add an equivalent assertion for a change path if it can be covered in the same scenario without making the test noisy.

- [ ] **Step 2: Run the app test to verify it fails**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: FAIL because the app does not yet react to the callback.

- [ ] **Step 3: Implement app integration**
  - Add a handler in `App` that selects the matching current file or change.
  - Reuse existing selection logic so the artifact panel preview updates immediately.
  - Set `historyActionMessage` to a clear success message.

- [ ] **Step 4: Re-run the app test**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit the app integration**

```bash
git add frontend/src/App.tsx frontend/src/App.test.tsx
git commit -m "feat: open current artifact paths from history"
```

## Chunk 4: Full Verification and Publish

### Task 4: Run full verification and publish branch

**Files:**
- Review only: modified files above

- [ ] **Step 1: Run the full project test suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend suites pass.

- [ ] **Step 2: Inspect git status**

Run: `git status --short`
Expected: only intended tracked changes plus any expected local dependency file in the worktree.

- [ ] **Step 3: Push the branch**

Run: `git push -u origin codex/generation-history-open-current-path`
Expected: branch published successfully.

- [ ] **Step 4: Open a PR**
  - Create a ready PR against `master` summarizing the new path jump behavior, files touched, and test coverage.
