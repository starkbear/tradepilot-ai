# Generation History Action Guidance Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing recovery guidance explicitly point to the best visible history-row action for the current comparison state.

**Architecture:** Keep the slice frontend-only inside `GenerationHistoryEntryPreview`. Extend the local recovery guidance helper to return a compact `recommendedActionLabel`, then render that label inside the existing `Suggested Next Step` block without changing row-action behavior or layout.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock recommended action behavior with component tests

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Add a failing test that expects `Recommended Action: Review` when drifted or current-only differences exist**
- [ ] **Step 2: Add a failing test that expects `Recommended Action: Continue` for additive-only preview differences**
- [ ] **Step 3: Add a failing test that expects `Recommended Action: Continue` when the historical artifact already matches the current artifact**
- [ ] **Step 4: Keep active previews and no-current-artifact previews on their current path with no recommended action line**
- [ ] **Step 5: Run `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx` and confirm it fails for the missing label**

## Chunk 2: Minimal implementation

### Task 2: Derive and render the recommended row action

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Extend the local recovery guidance type to include `recommendedActionLabel`**
- [ ] **Step 2: Return `Review` for drifted/current-only cases and `Continue` for additive-only and matching cases**
- [ ] **Step 3: Render a compact `Recommended Action` line inside the existing guidance block**
- [ ] **Step 4: Keep the rest of the preview layout and comparison logic unchanged**
- [ ] **Step 5: Run the focused component test until it passes**

## Chunk 3: Regression verification and commit

### Task 3: Verify the slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-04-04-generation-history-action-guidance-design.md`
- Create: `docs/superpowers/plans/2026-04-04-generation-history-action-guidance.md`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Commit docs with `docs: add generation history action guidance plan`**
- [ ] **Step 2: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 3: Commit implementation with `feat: add generation history action guidance`**
- [ ] **Step 4: Push `codex/generation-history-action-guidance` and hand back the PR link**
