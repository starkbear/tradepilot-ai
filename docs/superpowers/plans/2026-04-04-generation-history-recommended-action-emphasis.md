# Generation History Recommended Action Emphasis Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually mark the best existing history-row action when an expanded non-active generation preview is open.

**Architecture:** Keep the slice frontend-only inside `GenerationHistoryPanel`. Add a small recommendation helper that mirrors the current preview guidance rules, then use it to decorate the matching row action with a compact `Recommended` marker only for expanded non-active entries.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock recommendation-emphasis behavior with panel tests

**Files:**
- Create: `frontend/src/components/GenerationHistoryPanel.test.tsx`
- Verify: `frontend/src/components/GenerationHistoryPanel.tsx`

- [ ] **Step 1: Add a test that expects expanded drifted entries to mark `Review` as recommended**
- [ ] **Step 2: Add a test that expects expanded additive or matching entries to mark `Continue` as recommended**
- [ ] **Step 3: Add tests that collapsed entries and active entries do not show recommendation markers**
- [ ] **Step 4: Run `cmd /c npm run test -- --run src/components/GenerationHistoryPanel.test.tsx` and confirm it fails for the missing marker**

## Chunk 2: Minimal implementation

### Task 2: Derive and render the recommended action marker

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/styles.css`
- Verify: `frontend/src/components/GenerationHistoryPanel.test.tsx`

- [ ] **Step 1: Add a small comparison-based helper that returns `Review`, `Continue`, or `null` for each row**
- [ ] **Step 2: Extend row action rendering to mark the matching visible action when the row is expanded and non-active**
- [ ] **Step 3: Add a small inline `Recommended` marker style that fits the existing action layout**
- [ ] **Step 4: Run the focused panel test until it passes**

## Chunk 3: Regression verification and commit

### Task 3: Verify the slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-04-04-generation-history-recommended-action-emphasis-design.md`
- Create: `docs/superpowers/plans/2026-04-04-generation-history-recommended-action-emphasis.md`
- Create: `frontend/src/components/GenerationHistoryPanel.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Commit docs with `docs: add generation history recommended action emphasis plan`**
- [ ] **Step 2: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 3: Commit implementation with `feat: emphasize recommended generation history actions`**
- [ ] **Step 4: Push `codex/generation-history-recommended-action-emphasis` and hand back the PR link**
