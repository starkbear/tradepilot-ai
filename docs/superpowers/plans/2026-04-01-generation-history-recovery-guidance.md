# Generation History Recovery Guidance Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a suggested-next-step guidance block to non-active generation history previews.

**Architecture:** Keep the slice frontend-only inside `GenerationHistoryEntryPreview`. Derive a small recommendation object from the existing comparison summary and render it alongside the comparison counts without changing the existing history actions.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock recovery guidance behavior with component tests

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Add a failing test that expects `Review before restoring` when any drifted file or change paths exist**
- [ ] **Step 2: Add a failing test that expects `Restore when ready` for additive-only preview differences with no drifted paths**
- [ ] **Step 3: Add a failing test that expects `Stay with current` when the historical artifact fully matches the current artifact**
- [ ] **Step 4: Run `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx` and confirm it fails for the missing guidance block**

## Chunk 2: Minimal implementation

### Task 2: Derive and render suggested next-step guidance

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Add a small helper that turns `ComparisonSummary` into `title` and `body` guidance copy**
- [ ] **Step 2: Render a `Suggested Next Step` block inside the existing comparison area for non-active previews**
- [ ] **Step 3: Keep active previews and no-current-artifact previews on their existing paths with no guidance block**
- [ ] **Step 4: Run the focused component test until it passes**

## Chunk 3: Regression verification and commit

### Task 3: Verify the slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-04-01-generation-history-recovery-guidance-design.md`
- Create: `docs/superpowers/plans/2026-04-01-generation-history-recovery-guidance.md`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 2: Commit docs with `docs: add generation history recovery guidance plan`**
- [ ] **Step 3: Commit implementation with `feat: add generation history recovery guidance`**
- [ ] **Step 4: Push `codex/generation-history-recovery-guidance` and hand back the PR link**
