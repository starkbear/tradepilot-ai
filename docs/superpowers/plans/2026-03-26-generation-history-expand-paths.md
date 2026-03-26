# Generation History Expand Paths Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-category expand/collapse controls to generation-history comparison details so users can inspect full path lists in-place.

**Architecture:** Keep the change frontend-only inside `GenerationHistoryEntryPreview`. Reuse the existing comparison detail derivation, add local expanded-state tracking, and verify the behavior with focused component tests plus the full test suite.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock the expand/collapse behavior with component tests

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Extend the component test with an overflow section that should render `Show all`**
- [ ] **Step 2: Run `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx` and confirm it fails because the toggle UI is missing**
- [ ] **Step 3: Add assertions for `Show less` and returning to collapsed mode**
- [ ] **Step 4: Add a no-overflow assertion proving the toggle does not appear for short sections**

## Chunk 2: Minimal implementation

### Task 2: Add local expand/collapse controls to comparison detail sections

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Add local expanded-section state keyed by comparison detail**
- [ ] **Step 2: Switch displayed paths between capped and full arrays based on expanded state**
- [ ] **Step 3: Render `Show all` / `Show less` only for overflowing sections while preserving `Copy Paths`**
- [ ] **Step 4: Run the focused component test until it passes**

## Chunk 3: Verification and commit

### Task 3: Verify the full slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-03-26-generation-history-expand-paths-design.md`
- Create: `docs/superpowers/plans/2026-03-26-generation-history-expand-paths.md`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 2: Commit docs with `docs: add generation history expand paths plan`**
- [ ] **Step 3: Commit implementation with `feat: add generation history expand paths`**
- [ ] **Step 4: Push `codex/generation-history-expand-paths` and hand back the PR link**
