# Generation History Status Badges Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clear lifecycle badges to each generation history entry so users can quickly distinguish draft, applied, and attention-needed generations.

**Architecture:** Keep this slice frontend-only by deriving lifecycle badges from existing session data (`active_generation_id` and `apply_summary`) inside the generation history panel. Reuse the current badge UI and add small style variants for draft, applied, and warning states.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS

---

## Chunk 1: Badge Rendering Logic

### Task 1: Add failing tests for lifecycle badges

**Files:**
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests covering:
- draft entry shows `Draft`
- clean applied entry shows `Applied`
- entry with issues shows `Needs Attention`
- active entry still shows `Active` plus the correct lifecycle badge

- [ ] **Step 2: Run focused tests to verify failure**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 3: Commit failing-test checkpoint if desired**

Optional if helpful during local iteration.

## Chunk 2: UI Implementation

### Task 2: Render badges and style them

**Files:**
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/styles.css`
- Verify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`

- [ ] **Step 1: Implement lifecycle badge derivation**

In `GenerationHistoryPanel.tsx`:
- derive one lifecycle badge per entry
- render badges in title row after `Active`

- [ ] **Step 2: Add badge styling variants**

In `frontend/src/styles.css`:
- keep current active badge style
- add neutral draft badge
- add positive applied badge
- add warning attention badge

- [ ] **Step 3: Re-run focused tests**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 4: Commit UI badge implementation**

```bash
git add frontend/src/App.test.tsx frontend/src/components/GenerationHistoryPanel.tsx frontend/src/styles.css
git commit -m "feat: add generation history status badges"
```

## Chunk 3: Full Verification

### Task 3: Verify the full slice

**Files:**
- Verify only

- [ ] **Step 1: Run the full suite**

Run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
```

- [ ] **Step 2: Check worktree git status**

Run:
```bash
git status --short --branch
```

- [ ] **Step 3: Prepare PR handoff**

Report:
- branch name
- verification results
- PR readiness
