# Generation History Filter Controls Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lightweight filter controls to the generation history panel so users can quickly browse focus, attention, draft, and applied entries without changing backend state.

**Architecture:** Keep this slice frontend-only. Add one small filter state in `App`, pass it into `GenerationHistoryPanel`, and let the panel switch between the existing grouped `All` view and filtered single-section views. Reuse current lifecycle rules and entry actions.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS

---

## Chunk 1: Filter Behavior Tests

### Task 1: Add failing tests for filter controls

**Files:**
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests covering:
- `All` is the default filter
- `Needs Attention` filter shows only attention entries
- `Draft` filter shows only draft entries
- `Applied` filter shows only applied entries
- `Focus` filter shows active and attention entries
- empty filtered views show the expected empty-state copy

- [ ] **Step 2: Run focused tests to verify failure**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 3: Note selector updates for filter buttons and filtered regions**

Prefer role-based queries against buttons and labeled regions instead of brittle class-based queries.

## Chunk 2: App and Panel Implementation

### Task 2: Add filter state and filtered rendering

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/styles.css`
- Verify: `frontend/src/lib/types.ts`

- [ ] **Step 1: Add filter state in `App`**

Introduce a small local state value for the selected history filter and pass it down through `WorkspacePanel` into `GenerationHistoryPanel`.

- [ ] **Step 2: Add filter controls to the panel**

Render buttons for:
- `All`
- `Focus`
- `Needs Attention`
- `Draft`
- `Applied`

Each button should expose `aria-pressed` and update the selected filter.

- [ ] **Step 3: Implement filtered rendering rules**

In `GenerationHistoryPanel`:
- keep current grouped rendering for `All`
- render a single filtered section for other filters
- show an empty-state message when a non-`All` filter has no matches
- preserve preview / restore / remove behavior in every filtered view

- [ ] **Step 4: Add compact filter styling**

In `frontend/src/styles.css`:
- add a wrap-friendly filter row
- add selected/unselected button states
- keep the visual emphasis lower than entry badges and action buttons

- [ ] **Step 5: Re-run focused tests**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 6: Commit the filter UI**

```bash
git add frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/components/WorkspacePanel.tsx frontend/src/components/GenerationHistoryPanel.tsx frontend/src/styles.css
git commit -m "feat: add generation history filters"
```

## Chunk 3: Full Verification

### Task 3: Verify the full slice and prepare handoff

**Files:**
- Verify only

- [ ] **Step 1: Run the full suite**

Run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
```

- [ ] **Step 2: Check branch status**

Run:
```bash
git status --short --branch
```

- [ ] **Step 3: Prepare PR handoff**

Report:
- branch name
- verification results
- any local-only untracked files such as `package-lock.json`
