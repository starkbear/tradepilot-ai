# Generation History Entry Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lightweight metadata and expandable previews to recent generation history entries so users can inspect saved generations before restoring them.

**Architecture:** Keep this as a frontend-only enhancement. Extend `App.tsx` with a single `expandedGenerationId` state, pass it into `GenerationHistoryPanel`, and render preview details through a new focused `GenerationHistoryEntryPreview` component. Reuse the artifact data already stored inside `GenerationHistoryEntry` and avoid backend changes.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Preview state and panel rendering

### Task 1: Add failing panel tests for metadata and preview toggling

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Test: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Add tests that verify:
- each history entry shows a readable saved timestamp and file/change counts
- clicking `Preview <goal>` expands entry details
- clicking preview on a second entry collapses the first one

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: FAIL because the current history panel has no preview toggle or metadata rows.

- [ ] **Step 3: Write minimal implementation**

Modify `frontend/src/App.tsx` to add `expandedGenerationId` state and handlers.
Extend `frontend/src/components/GenerationHistoryPanel.tsx` props to accept expanded state and preview callbacks.
Create `frontend/src/components/GenerationHistoryEntryPreview.tsx` for the expanded body.

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: PASS for the new preview and metadata tests.

- [ ] **Step 5: Commit**

Run:
```bash
git add frontend/src/App.test.tsx frontend/src/App.tsx frontend/src/components/GenerationHistoryPanel.tsx frontend/src/components/GenerationHistoryEntryPreview.tsx

git commit -m "feat: add generation history previews"
```

## Chunk 2: Preview styling and interaction edge cases

### Task 2: Add regression tests for restore/delete interactions with expanded previews

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/styles.css`
- Test: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Add tests that verify:
- restoring a generation clears the expanded preview state
- deleting the expanded generation collapses the preview cleanly
- clearing history clears preview state and hides the panel

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: FAIL because expanded preview state is not yet cleared across all session mutations.

- [ ] **Step 3: Write minimal implementation**

Update the restore, delete, and clear-history flows in `frontend/src/App.tsx` to reset `expandedGenerationId` when appropriate.
Thread props through `frontend/src/components/WorkspacePanel.tsx` only if needed.
Add compact styles in `frontend/src/styles.css` for metadata rows, preview cards, and preview toggles.

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: PASS for all history preview interaction cases.

- [ ] **Step 5: Commit**

Run:
```bash
git add frontend/src/App.test.tsx frontend/src/App.tsx frontend/src/components/WorkspacePanel.tsx frontend/src/styles.css

git commit -m "fix: reset history preview state on session changes"
```

## Chunk 3: Full verification and branch handoff

### Task 3: Run the full suite and prepare the branch

**Files:**
- Verify: `backend/tests`
- Verify: `frontend/src`

- [ ] **Step 1: Run focused frontend regression**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the full project test suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend suites both PASS.

- [ ] **Step 3: Inspect git status**

Run: `git status --short`
Expected: only intended feature files are modified.

- [ ] **Step 4: Create the final handoff commit if needed**

If the work is already covered by the chunk commits, skip an extra commit. Otherwise create a small follow-up commit for any final polish.

- [ ] **Step 5: Push the branch**

Run:
```bash
git push -u origin codex/generation-history-entry-preview
```
Expected: branch published and ready for PR creation.
