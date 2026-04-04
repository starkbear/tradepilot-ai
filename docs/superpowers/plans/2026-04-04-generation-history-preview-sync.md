# Generation History Preview Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the restored history entry expanded after a successful continue/restore flow so the history panel stays visually aligned with the newly active generation.

**Architecture:** This is a frontend-only state-sync slice centered in `frontend/src/App.tsx`. The restore handler will pass restore context into session application, and session application will selectively preserve `expandedGenerationId` only for successful restore flows whose target still exists in the returned generation history.

**Tech Stack:** React, TypeScript, Vitest, Testing Library.

---

## Chunk 1: Lock the restore-sync behavior with tests

### Task 1: Add failing restore-sync coverage

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Test: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test showing that after clicking `Continue` on a history entry, the restored entry remains expanded and its preview region is still visible.

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: FAIL because restore currently clears `expandedGenerationId`.

- [ ] **Step 3: Add a regression assertion for non-restore session application**

Extend or add a test that proves startup/session hydration still collapses previews by default.

- [ ] **Step 4: Run test to verify the new expectation still fails for the restore path only**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: restore-sync test fails, unrelated session tests stay green.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.test.tsx
git commit -m "test: cover generation history preview sync"
```

## Chunk 2: Implement minimal restore-context sync

### Task 2: Preserve expanded preview only for successful restore flows

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add minimal restore context support to session application**

Update `applyRestoredSession()` to accept optional metadata for why the snapshot is being applied, including the restore target generation id.

- [ ] **Step 2: Implement the minimal state sync**

On successful restore:
- keep `expandedGenerationId` set to the restored target if it exists in `snapshot.generation_history`
- otherwise fall back to collapsed state

For all other callers (`loadSession`, `clearSession`, `generate`, delete, clear-history), preserve the existing reset behavior.

- [ ] **Step 3: Keep failure behavior unchanged**

Do not change the current restore failure path beyond leaving the preview state intact.

- [ ] **Step 4: Run focused tests**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/App.test.tsx
git commit -m "feat: sync restored history preview state"
```

## Chunk 3: Verify the whole branch

### Task 3: Full regression verification

**Files:**
- Verify only

- [ ] **Step 1: Run the full project test suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend test suites both pass.

- [ ] **Step 2: Inspect branch status**

Run: `git status --short`
Expected: clean worktree.

- [ ] **Step 3: Push branch for review**

Run: `git push -u origin codex/generation-history-preview-sync`
Expected: branch pushed and PR URL available.
