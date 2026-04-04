# Generation History Action Feedback Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight inline success note for recent generation-history actions.

**Architecture:** Keep the slice frontend-only. Store the latest history-action feedback string in `App.tsx`, feed it into `WorkspacePanel`, and render it near `GenerationHistoryPanel` without changing any backend contracts or action semantics.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock history-action feedback behavior with app tests

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Verify: `frontend/src/App.tsx`
- Verify: `frontend/src/components/WorkspacePanel.tsx`

- [ ] **Step 1: Add a test that expects preview open/hide feedback after toggling a history preview**
- [ ] **Step 2: Add a test that expects continue/restore feedback after a successful restore flow**
- [ ] **Step 3: Add a test that expects remove and clear-history feedback after those actions succeed**
- [ ] **Step 4: Add a test that confirms stale feedback is cleared when a history action fails**
- [ ] **Step 5: Run `cmd /c npm run test -- --run src/App.test.tsx` and confirm it fails for the missing feedback note**

## Chunk 2: Minimal implementation

### Task 2: Add and render the history-action feedback note

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/styles.css`
- Verify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Add `historyActionMessage` state in `App.tsx` and reset rules for failed actions and login/session clear flows**
- [ ] **Step 2: Set human-readable feedback strings for preview, review, restore/continue, delete, and clear-history success paths**
- [ ] **Step 3: Render a small success-style note near the generation history panel in `WorkspacePanel`**
- [ ] **Step 4: Run the focused app test until it passes**

## Chunk 3: Regression verification and commit

### Task 3: Verify the slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-04-04-generation-history-action-feedback-design.md`
- Create: `docs/superpowers/plans/2026-04-04-generation-history-action-feedback.md`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Commit docs with `docs: add generation history action feedback plan`**
- [ ] **Step 2: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 3: Commit implementation with `feat: add generation history action feedback`**
- [ ] **Step 4: Push `codex/generation-history-action-feedback` and hand back the PR link**
