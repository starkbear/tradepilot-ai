# Generation History Apply Summary Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist a compact apply summary on the active generation history entry and surface it in the Recent Generations UI.

**Architecture:** Extend the session snapshot with a nullable `apply_summary` field on each history entry, update it inside `SessionStore.update_after_apply()`, and render compact plus expanded summaries in the generation history panel. Keep the existing apply API contract unchanged and continue storing the full top-level `apply_result` for the active artifact area.

**Tech Stack:** FastAPI, Pydantic, React 19, TypeScript, Vitest, Testing Library

---

## Chunk 1: Backend Apply Summary Persistence

### Task 1: Extend session models

**Files:**
- Modify: `backend/app/models/schemas.py`
- Test: `backend/tests/test_session_store.py`

- [ ] **Step 1: Write the failing backend model/store tests**

Add tests covering:
- active history entry receives `apply_summary` after apply
- non-active entries remain unchanged
- no history entry is changed when `active_generation_id` is `None`

- [ ] **Step 2: Run the focused backend tests to verify failure**

Run:
```powershell
$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_session_store.py -q
```

- [ ] **Step 3: Implement the new summary schema**

Add:
- `GenerationApplySummary`
- `apply_summary: GenerationApplySummary | None = None` on `GenerationHistoryEntry`

- [ ] **Step 4: Update session-store apply persistence**

Inside `SessionStore.update_after_apply()`:
- keep top-level `apply_result`
- derive counts plus UTC timestamp
- patch only the active history entry

- [ ] **Step 5: Re-run focused backend tests**

Run:
```powershell
$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_session_store.py -q
```

- [ ] **Step 6: Commit backend model persistence**

```bash
git add backend/app/models/schemas.py backend/tests/test_session_store.py backend/app/services/session_store.py
git commit -m "feat: persist apply summaries in generation history"
```

## Chunk 2: Frontend History Summary Rendering

### Task 2: Extend frontend types and render compact history metadata

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/components/GenerationHistoryEntryPreview.tsx`
- Test: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing frontend tests**

Add tests covering:
- compact apply summary text shows in Recent Generations when present
- expanded preview shows an `Apply Summary` block
- entries without `apply_summary` do not render that block

- [ ] **Step 2: Run the focused frontend tests to verify failure**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 3: Extend frontend session types**

Add `GenerationApplySummary` and `apply_summary` to `GenerationHistoryEntry` in `frontend/src/lib/types.ts`.

- [ ] **Step 4: Render compact status in the history list**

Update `GenerationHistoryPanel.tsx` to show concise metadata such as:
- applied count
- applied files/changes breakdown
- issue count when non-zero

- [ ] **Step 5: Render expanded apply summary details**

Update `GenerationHistoryEntryPreview.tsx` to show the `Apply Summary` block only when present.

- [ ] **Step 6: Re-run focused frontend tests**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

- [ ] **Step 7: Commit frontend history summary rendering**

```bash
git add frontend/src/lib/types.ts frontend/src/components/GenerationHistoryPanel.tsx frontend/src/components/GenerationHistoryEntryPreview.tsx frontend/src/App.test.tsx
git commit -m "feat: show apply summaries in generation history"
```

## Chunk 3: Full Verification

### Task 3: Verify the end-to-end slice

**Files:**
- Verify only

- [ ] **Step 1: Run the full project test suite**

Run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
```

- [ ] **Step 2: Inspect git status**

Run:
```bash
git status --short --branch
```

- [ ] **Step 3: Commit any remaining plan-scope adjustments**

If verification required a tiny fix, commit it before handoff.

- [ ] **Step 4: Prepare branch handoff**

Report:
- branch name
- validation results
- PR readiness
