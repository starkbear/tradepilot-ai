# Generation History Path Filter Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-section path filtering to expanded generation-history comparison detail lists so users can quickly find specific paths.

**Architecture:** Keep the change frontend-only inside `GenerationHistoryEntryPreview`. Reuse the existing expanded-section behavior, add local filter state keyed by section, and validate with focused component tests plus the full test suite.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock expanded-section filter behavior with component tests

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Add a failing test that expands an overflowing section and expects a `Filter paths` input**
- [ ] **Step 2: Assert that typing filters the displayed path list case-insensitively**
- [ ] **Step 3: Add a no-match assertion that expects `No matching paths.`**
- [ ] **Step 4: Run `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx` and confirm it fails for the missing filter UI**

## Chunk 2: Minimal implementation

### Task 2: Add local filter inputs to expanded comparison detail sections

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Add local filter-query state keyed by comparison-detail key**
- [ ] **Step 2: Render a `Filter paths` input only for expanded overflowing sections**
- [ ] **Step 3: Filter displayed paths in-place and show `No matching paths.` when empty**
- [ ] **Step 4: Clear the local filter when collapsing a section and rerun the focused test until it passes**

## Chunk 3: Verification and commit

### Task 3: Verify the follow-up and push it to the active PR branch

**Files:**
- Create: `docs/superpowers/specs/2026-03-26-generation-history-path-filter-design.md`
- Create: `docs/superpowers/plans/2026-03-26-generation-history-path-filter.md`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 2: Commit docs with `docs: add generation history path filter plan`**
- [ ] **Step 3: Commit implementation with `feat: add generation history path filter`**
- [ ] **Step 4: Push `codex/generation-history-expand-paths` so the existing PR picks up the follow-up**
