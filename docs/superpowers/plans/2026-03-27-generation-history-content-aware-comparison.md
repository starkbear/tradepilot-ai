# Generation History Content-Aware Comparison Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make history comparison previews distinguish between matching and drifted shared file/change paths.

**Architecture:** Keep the slice frontend-only inside `GenerationHistoryEntryPreview`. Replace the old path-only shared buckets with content-aware buckets derived from normalized signatures, then reuse the existing detail rendering path for the new matching/drifted sections.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## Chunk 1: Focused TDD

### Task 1: Lock content-aware comparison behavior with component tests

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Extend the comparison fixtures so at least one shared file path matches, one shared file path drifts, one shared change path matches, and one shared change path drifts**
- [ ] **Step 2: Add failing assertions for the new summary labels and counts: `Matching Files`, `Drifted Files`, `Matching Changes`, and `Drifted Changes`**
- [ ] **Step 3: Add failing interaction coverage for revealing matching and drifted detail sections on demand**
- [ ] **Step 4: Run `cmd /c npm run test -- --run src/components/GenerationHistoryEntryPreview.test.tsx` and confirm it fails for the missing content-aware comparison UI**

## Chunk 2: Minimal implementation

### Task 2: Split shared paths by content signature

**Files:**
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Add small signature helpers for file drafts and change drafts**
- [ ] **Step 2: Replace the old shared summary fields with matching/drifted counts and path arrays**
- [ ] **Step 3: Add toggle labels and detail builders for matching/drifted categories while preserving the current detail-section renderer**
- [ ] **Step 4: Run the focused component test until it passes**

## Chunk 3: Regression verification and commit

### Task 3: Verify the slice and commit it cleanly

**Files:**
- Create: `docs/superpowers/specs/2026-03-27-generation-history-content-aware-comparison-design.md`
- Create: `docs/superpowers/plans/2026-03-27-generation-history-content-aware-comparison.md`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.test.tsx`

- [ ] **Step 1: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**
- [ ] **Step 2: Commit docs with `docs: add content-aware history comparison plan`**
- [ ] **Step 3: Commit implementation with `feat: add content-aware history comparison`**
- [ ] **Step 4: Push `codex/generation-history-content-aware-comparison` and hand back the PR link**
