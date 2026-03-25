# Generation History Primary Actions Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emphasize the most useful next action for each generation history entry while preserving the current preview, restore, and remove capabilities.

**Architecture:** Keep this slice frontend-only. Add a small derived action mapping inside `GenerationHistoryPanel` so each entry renders one primary action and a reduced set of secondary actions based on active state and lifecycle status. Reuse existing preview and restore handlers.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS

---

## Chunk 1: Primary Action Tests

### Task 1: Add failing tests for context-aware entry actions

**Files:**
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests covering:
- active entry shows `Preview` and no restore button
- `Needs Attention` entry shows `Review`
- draft and applied entries show `Continue`
- clicking `Review` opens the corresponding preview
- clicking `Continue` still triggers the restore request path

- [ ] **Step 2: Run focused tests to verify failure**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 3: Update selectors to match primary vs secondary actions**

Use explicit role/name queries so tests keep targeting the intended action button after labels change.

## Chunk 2: Panel Implementation

### Task 2: Add context-aware primary actions in the history panel

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Derive primary action metadata per entry**

In `GenerationHistoryPanel.tsx`:
- identify lifecycle state
- map each entry to a primary action label and handler
- keep current action handlers (`onTogglePreview`, `onRestore`, `onRemove`) unchanged underneath

- [ ] **Step 2: Render per-state action sets**

Update each row so:
- active entry shows primary `Preview` / `Hide Preview` and secondary `Remove`
- `Needs Attention` entry shows primary `Review`, secondary `Restore`, secondary `Remove`
- draft/applied entries show primary `Continue`, secondary `Preview`, secondary `Remove`

- [ ] **Step 3: Add lightweight visual emphasis for the primary action**

Keep the primary action on the existing filled button treatment and keep the remaining actions secondary.

- [ ] **Step 4: Re-run focused tests**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 5: Commit the primary action UI**

```bash
git add frontend/src/App.test.tsx frontend/src/components/GenerationHistoryPanel.tsx frontend/src/styles.css
git commit -m "feat: emphasize primary generation history actions"
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
- any local-only untracked files from dependency install
