# Generation History Focus Sorting Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder and group generation history entries so the current and attention-needed items are easier to spot without changing backend state.

**Architecture:** Keep this slice frontend-only by deriving a display priority and focus grouping inside `GenerationHistoryPanel`. Reuse existing lifecycle badge rules and actions, add lightweight section headings, and keep all preview/restore/remove behavior unchanged.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS

---

## Chunk 1: Sorting and Grouping Tests

### Task 1: Add failing tests for grouped history rendering

**Files:**
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests covering:
- active entry renders under `Focus Now`
- non-active `Needs Attention` entry also renders under `Focus Now`
- `Draft` and `Applied` entries render under `Recent History`
- entries within the same section remain ordered by newest `created_at`

- [ ] **Step 2: Run focused tests to verify failure**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 3: Capture any selector updates needed for grouped sections**

Adjust test queries to target headings/containers rather than relying on the old flat list structure.

## Chunk 2: History Panel Implementation

### Task 2: Group and sort history entries in the panel

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Add frontend-only display helpers**

In `GenerationHistoryPanel.tsx`:
- derive lifecycle status as today
- derive a display priority from active state plus lifecycle state
- split entries into `Focus Now` and `Recent History`
- sort each section by priority and then `created_at` descending

- [ ] **Step 2: Render grouped sections without changing item actions**

Update the panel markup to:
- render `Focus Now` only when needed
- render `Recent History` for the remaining entries
- keep `Preview`, `Restore`/`Current`, `Remove`, and entry previews working exactly as before

- [ ] **Step 3: Clean up history metadata separators while touching copy**

Replace the existing broken separator text in metadata lines with a stable ASCII separator such as ` / `.

- [ ] **Step 4: Add section styling**

In `frontend/src/styles.css`:
- add layout for grouped sections and section headings
- preserve current active highlight and badge styling
- avoid introducing a new visual hierarchy that competes with the entry badges

- [ ] **Step 5: Re-run focused tests**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 6: Commit the grouped history UI**

```bash
git add frontend/src/App.test.tsx frontend/src/components/GenerationHistoryPanel.tsx frontend/src/styles.css
git commit -m "feat: group generation history by focus"
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
- whether any local-only files such as `package-lock.json` remain uncommitted
