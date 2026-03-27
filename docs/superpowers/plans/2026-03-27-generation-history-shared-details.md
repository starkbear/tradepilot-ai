# Generation History Shared Details Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add on-demand shared-file and shared-change path details to generation-history comparison previews.

**Architecture:** Keep the change frontend-only inside `GenerationHistoryEntryPreview`. Extend the comparison summary with shared path arrays, add lightweight visibility toggles, and reuse the existing detail rendering interactions for any visible shared section.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock shared-details behavior with component tests

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Add a failing test that expects `Show shared files` and `Show shared changes` when shared counts are non-zero**
- [ ] **Step 2: Assert that expanding a shared section reveals the expected shared path list and that hiding it collapses again**
- [ ] **Step 3: Add a no-shared assertion that proves the shared toggles do not render when counts are zero**
- [ ] **Step 4: Run `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx` and confirm it fails for the missing shared-detail UI**

## Chunk 2: Minimal implementation

### Task 2: Add shared detail sections on top of the existing comparison renderer

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Extend `ComparisonSummary` with sorted shared-path arrays**
- [ ] **Step 2: Add local visibility state for shared sections and render summary toggle buttons**
- [ ] **Step 3: Reuse the existing detail-section rendering path for any visible shared section**
- [ ] **Step 4: Run the focused component test until it passes**

## Chunk 3: Verification and commit

### Task 3: Verify the slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-03-27-generation-history-shared-details-design.md`
- Create: `docs/superpowers/plans/2026-03-27-generation-history-shared-details.md`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 2: Commit docs with `docs: add generation history shared details plan`**
- [ ] **Step 3: Commit implementation with `feat: add generation history shared details`**
- [ ] **Step 4: Push `codex/generation-history-shared-details` and hand back the PR link**
