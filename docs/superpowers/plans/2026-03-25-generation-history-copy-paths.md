# Generation History Copy Paths Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-category copy actions to generation-history comparison details so users can copy the full path list for any difference bucket.

**Architecture:** Keep the change frontend-only inside `GenerationHistoryEntryPreview`. Reuse the existing comparison detail derivation, add local clipboard/status state, and validate the behavior with focused component tests plus the full test suite.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock the copy behavior with component tests

**Files:**
- Create: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Extend the comparison preview test to cover copy success**
- [ ] **Step 2: Run `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx` and verify it fails for the missing copy UI**
- [ ] **Step 3: Add a clipboard rejection test for failure feedback**
- [ ] **Step 4: Re-run the focused test and confirm the failure still points at missing production behavior**

## Chunk 2: Minimal implementation

### Task 2: Add per-section copy controls and local feedback

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Add stable keys to comparison detail items and local state for last copy result**
- [ ] **Step 2: Implement `navigator.clipboard.writeText(paths.join('\n'))` for each detail section**
- [ ] **Step 3: Render `Copy Paths` plus section-local success/failure feedback**
- [ ] **Step 4: Run the focused test until it passes green**

## Chunk 3: Verification and commit

### Task 3: Verify the whole slice and commit it cleanly

**Files:**
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Verify: `docs/superpowers/specs/2026-03-25-generation-history-copy-paths-design.md`
- Create: `docs/superpowers/plans/2026-03-25-generation-history-copy-paths.md`

- [ ] **Step 1: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 2: Commit docs with `docs: add generation history copy paths plan`**
- [ ] **Step 3: Commit implementation with `feat: add generation history copy paths`**
- [ ] **Step 4: Push `codex/generation-history-copy-paths` and hand back the PR link**
