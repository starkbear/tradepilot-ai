# Generation History Action Focus Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the visual focus on the already-recommended history row action for expanded non-active entries.

**Architecture:** Keep the slice frontend-only in `GenerationHistoryPanel`. Reuse the existing `isRecommended` flag and add a dedicated emphasis class to the matching button, then cover the behavior with focused panel tests.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock recommended-action focus behavior with panel tests

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.test.tsx`
- Verify: `frontend/src/components/GenerationHistoryPanel.tsx`

- [ ] **Step 1: Add assertions that expanded recommended `Review` buttons render with a recommendation emphasis class**
- [ ] **Step 2: Add assertions that expanded recommended `Continue` buttons render with the same emphasis class**
- [ ] **Step 3: Keep collapsed rows and active rows free of that emphasis class**
- [ ] **Step 4: Run `cmd /c npm run test -- --run src/components/GenerationHistoryPanel.test.tsx` and confirm it fails for the missing class**

## Chunk 2: Minimal implementation

### Task 2: Add a stronger recommendation emphasis style

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/styles.css`
- Verify: `frontend/src/components/GenerationHistoryPanel.test.tsx`

- [ ] **Step 1: Add a recommendation emphasis class to actions that already carry `isRecommended`**
- [ ] **Step 2: Style the emphasized button so it stands out more than neighboring actions while preserving current semantics**
- [ ] **Step 3: Keep the existing `Recommended` marker and all button behaviors unchanged**
- [ ] **Step 4: Run the focused panel test until it passes**

## Chunk 3: Regression verification and commit

### Task 3: Verify the slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-04-04-generation-history-action-focus-design.md`
- Create: `docs/superpowers/plans/2026-04-04-generation-history-action-focus.md`
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/components/GenerationHistoryPanel.test.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Commit docs with `docs: add generation history action focus plan`**
- [ ] **Step 2: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 3: Commit implementation with `feat: add generation history action focus`**
- [ ] **Step 4: Push `codex/generation-history-action-focus` and hand back the PR link**
