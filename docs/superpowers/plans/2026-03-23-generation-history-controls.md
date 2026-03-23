# Generation History Controls Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add single-entry removal and full-history clearing controls to the local generation history flow without disturbing the active artifact state.

**Architecture:** Extend the existing session store and session routes so history mutations stay inside the current local session snapshot. Keep frontend changes isolated to the existing generation history panel and reuse the current session hydration flow in `App.tsx`.

**Tech Stack:** FastAPI, Pydantic, React, TypeScript, Vitest, pytest

---

## Chunk 1: Backend history controls

### Task 1: Add failing backend tests for history deletion

**Files:**
- Modify: `backend/tests/test_session_store.py`
- Modify: `backend/tests/test_session_api.py`

- [ ] **Step 1: Write the failing session-store tests**

Add tests covering:
- deleting a known generation removes only that entry
- clearing history empties `generation_history` but keeps the active artifact

- [ ] **Step 2: Run the focused backend tests to verify they fail**

Run:
```powershell
$env:PYTHONPATH='backend/.vendor;backend'; python -m pytest backend/tests/test_session_store.py backend/tests/test_session_api.py -q --basetemp .pytest-temp-history-controls-red
```

Expected:
- FAIL because `SessionStore` has no delete/clear history controls yet

- [ ] **Step 3: Implement the minimal backend behavior**

Modify:
- `backend/app/services/session_store.py`
- `backend/app/api/routes/session.py`

Add:
- `delete_generation(generation_id: str)`
- `clear_generation_history()`
- `DELETE /api/session/generations/{generation_id}`
- `DELETE /api/session/generations`

Rules:
- keep `artifact`, selection, and workspace fields unchanged
- return `404` response when an entry id does not exist

- [ ] **Step 4: Re-run the focused backend tests to verify they pass**

Run:
```powershell
$env:PYTHONPATH='backend/.vendor;backend'; python -m pytest backend/tests/test_session_store.py backend/tests/test_session_api.py -q --basetemp .pytest-temp-history-controls-green
```

Expected:
- PASS

- [ ] **Step 5: Commit the backend chunk**

```bash
git add backend/app/services/session_store.py backend/app/api/routes/session.py backend/tests/test_session_store.py backend/tests/test_session_api.py
git commit -m "feat: add generation history session controls"
```

## Chunk 2: Frontend history controls

### Task 2: Add history management controls to the workspace panel

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Write the failing frontend tests**

Add tests covering:
- each history item renders a `Remove` button
- removing one entry updates the history panel
- clearing history hides the panel
- failing delete/clear keeps the panel visible and shows an error

- [ ] **Step 2: Run the focused frontend tests to verify they fail**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

Expected:
- FAIL because the panel does not yet expose delete/clear controls

- [ ] **Step 3: Implement the minimal frontend behavior**

Add API helpers for the new delete routes and wire them into:
- `GenerationHistoryPanel`
- `WorkspacePanel`
- `App.tsx`

Requirements:
- disable buttons while a history action is in flight
- rehydrate from returned session snapshots
- preserve current artifact preview if an API call fails

- [ ] **Step 4: Re-run the focused frontend tests to verify they pass**

Run:
```powershell
cmd /c npm run test -- --run src/App.test.tsx
```

Expected:
- PASS

- [ ] **Step 5: Commit the frontend chunk**

```bash
git add frontend/src/App.test.tsx frontend/src/App.tsx frontend/src/components/GenerationHistoryPanel.tsx frontend/src/components/WorkspacePanel.tsx frontend/src/lib/api.ts frontend/src/styles.css
git commit -m "feat: add generation history management controls"
```

## Chunk 3: Full verification

### Task 3: Run the full suite and prepare the branch

**Files:**
- Verify only

- [ ] **Step 1: Run the full project verification**

Run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
```

Expected:
- backend tests all pass
- frontend tests all pass

- [ ] **Step 2: Check the final git status**

Run:
```bash
git status --short
```

Expected:
- only intended tracked changes remain
- local-only directories like `backend/.vendor/` or `node_modules/` stay untracked

- [ ] **Step 3: Create the final feature commit if needed**

```bash
git add <intended-files>
git commit -m "feat: add generation history controls"
```

- [ ] **Step 4: Push the branch**

```bash
git push -u origin codex/generation-history-controls
```
