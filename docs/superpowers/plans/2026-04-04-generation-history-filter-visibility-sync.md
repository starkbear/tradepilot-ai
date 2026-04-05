# Generation History Filter Visibility Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep an expanded history entry visible by auto-switching the panel to `Focus` when the current non-`All` filter would otherwise hide it after a state change.

**Architecture:** This is a frontend-only behavior change inside `GenerationHistoryPanel`. The component will detect when its expanded generation no longer belongs to the active filtered section, switch the local filter to `focus`, and render a small helper note so the automatic change feels intentional.

**Tech Stack:** React, TypeScript, Vitest, Testing Library.

---

## Chunk 1: Lock the fallback behavior with focused panel tests

### Task 1: Add failing component coverage

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.test.tsx`
- Test: `frontend/src/components/GenerationHistoryPanel.test.tsx`

- [ ] **Step 1: Write the failing auto-focus test**

Cover the case where the panel is on `Needs Attention`, an entry is expanded, props change so that entry no longer matches the filter, and the panel falls back to `Focus` while keeping the entry visible.

- [ ] **Step 2: Add helper-note coverage**

Assert that the helper copy appears after the automatic fallback and disappears after the user manually selects another filter.

- [ ] **Step 3: Run the focused component test file**

Run: `cmd /c npm run test -- --run src/components/GenerationHistoryPanel.test.tsx`
Expected: FAIL before implementation.

## Chunk 2: Implement minimal filter fallback logic

### Task 2: Add visibility-aware filter sync

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`

- [ ] **Step 1: Add a helper to determine filtered visibility**

Reuse existing filter/build helpers so the component can tell whether the currently expanded entry is still included in the active non-`all` filter.

- [ ] **Step 2: Add local helper-note state and auto-focus effect**

When the expanded entry falls out of the active filter, switch to `focus` and show a small helper note. Clear the note on manual filter changes.

- [ ] **Step 3: Run focused tests**

Run: `cmd /c npm run test -- --run src/components/GenerationHistoryPanel.test.tsx`
Expected: PASS.

## Chunk 3: Verify and publish the updated branch

### Task 3: Full regression verification

**Files:**
- Verify only

- [ ] **Step 1: Run the full project test suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend both pass.

- [ ] **Step 2: Commit the branch update**

```bash
git add docs/superpowers/specs/2026-04-04-generation-history-filter-visibility-sync-design.md docs/superpowers/plans/2026-04-04-generation-history-filter-visibility-sync.md frontend/src/components/GenerationHistoryPanel.tsx frontend/src/components/GenerationHistoryPanel.test.tsx
git commit -m "feat: keep filtered history previews visible"
```

- [ ] **Step 3: Push the same PR branch**

Run: `git push -u origin codex/generation-history-preview-sync`
Expected: existing PR updates with the new slice.
