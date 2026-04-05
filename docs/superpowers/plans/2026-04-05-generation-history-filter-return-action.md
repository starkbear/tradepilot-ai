# Generation History Filter Return Action Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give users an explicit `Back to <filter>` helper action after the history panel auto-switches to `Focus` to preserve an expanded preview.

**Architecture:** This is a frontend-only follow-up inside `GenerationHistoryPanel`. The panel will remember which filter it auto-left, render a helper note with a return action, and clear that state whenever the user manually changes filters or uses the return action.

**Tech Stack:** React, TypeScript, Vitest, Testing Library.

---

## Chunk 1: Lock the helper action behavior with focused tests

### Task 1: Add failing component coverage

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.test.tsx`
- Test: `frontend/src/components/GenerationHistoryPanel.test.tsx`

- [ ] **Step 1: Extend the auto-focus test**

Assert that the helper note now includes a `Back to Needs Attention` action after the automatic fallback.

- [ ] **Step 2: Add a return-action test**

Cover clicking the helper action so the panel returns to the previous filter, clears the helper note, and shows the restored filter section again.

- [ ] **Step 3: Run focused tests**

Run: `cmd /c npm run test -- --run src/components/GenerationHistoryPanel.test.tsx`
Expected: FAIL before implementation.

## Chunk 2: Implement minimal return-action state

### Task 2: Add filter return helper support

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`

- [ ] **Step 1: Add local return-target state**

Track the previous filter only when the panel auto-switches to `focus`.

- [ ] **Step 2: Render the helper action**

Show a small `Back to <filter>` button next to the auto-focus note and wire it to restore the prior filter.

- [ ] **Step 3: Clear stale helper state**

Clear the return target when the user manually selects a filter or uses the helper action.

- [ ] **Step 4: Run focused tests**

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
git add docs/superpowers/specs/2026-04-05-generation-history-filter-return-action-design.md docs/superpowers/plans/2026-04-05-generation-history-filter-return-action.md frontend/src/components/GenerationHistoryPanel.tsx frontend/src/components/GenerationHistoryPanel.test.tsx
git commit -m "feat: add history filter return action"
```

- [ ] **Step 3: Push the same PR branch**

Run: `git push -u origin codex/generation-history-preview-sync`
Expected: existing PR updates with the new slice.
