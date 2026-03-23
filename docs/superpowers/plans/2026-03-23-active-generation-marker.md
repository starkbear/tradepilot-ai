# Active Generation Marker Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist and render an explicit active generation marker so the history panel clearly shows which saved generation matches the current workspace state.

**Architecture:** Add `active_generation_id` to the persisted session snapshot and update session store transitions on generate, restore, delete, clear-history, and clear-session. Then thread that field through the frontend so `GenerationHistoryPanel` can mark the active entry, disable redundant restores, and keep the marker consistent after user actions.

**Tech Stack:** FastAPI, Pydantic, React, TypeScript, Vitest, pytest

---

## Chunk 1: Backend active generation persistence

### Task 1: Add failing backend tests for active generation state transitions

**Files:**
- Modify: `backend/tests/test_session_store.py`
- Modify: `backend/tests/test_session_api.py`
- Modify: `backend/app/models/schemas.py`
- Modify: `backend/app/services/session_store.py`

- [ ] **Step 1: Write the failing tests**

Add tests that verify:
- generating a new artifact sets `active_generation_id`
- restoring a generation sets `active_generation_id` to that entry id
- deleting the active entry clears `active_generation_id`
- deleting a non-active entry preserves `active_generation_id`
- clearing history clears `active_generation_id`

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
$env:PYTHONPATH='backend/.vendor;backend'; python -m pytest backend/tests/test_session_store.py backend/tests/test_session_api.py -q
```
Expected: FAIL because the session schema and store do not yet track an active generation id.

- [ ] **Step 3: Write minimal implementation**

Update `backend/app/models/schemas.py` to add `active_generation_id: str | None = None` to the persisted session snapshot model.
Update `backend/app/services/session_store.py` so generate/restore/delete/clear flows manage that field exactly as specified in the design.
Keep API route behavior unchanged except for returning the new field in snapshots.

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
$env:PYTHONPATH='backend/.vendor;backend'; python -m pytest backend/tests/test_session_store.py backend/tests/test_session_api.py -q
```
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add backend/app/models/schemas.py backend/app/services/session_store.py backend/tests/test_session_store.py backend/tests/test_session_api.py

git commit -m "feat: persist active generation state"
```

## Chunk 2: Frontend active marker rendering

### Task 2: Add failing frontend tests for active history entry UI

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify: `frontend/src/components/WorkspacePanel.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Write the failing tests**

Add tests that verify:
- an active history entry shows an `Active` badge
- the active entry shows `Current` instead of `Restore`
- restoring a different generation moves the active badge
- deleting the active entry removes the badge
- deleting a non-active entry preserves the badge

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cmd /c npm run test -- --run src/App.test.tsx
```
Expected: FAIL because the frontend does not yet know about `active_generation_id` or render active entry state.

- [ ] **Step 3: Write minimal implementation**

Update `frontend/src/lib/types.ts` to include `active_generation_id` in `PersistedSessionSnapshot`.
Update `frontend/src/App.tsx` to hold and rehydrate that field.
Update `frontend/src/components/GenerationHistoryPanel.tsx` to render active-entry styling, badge, and `Current` button state.
Add the minimal supporting styles in `frontend/src/styles.css`.

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cmd /c npm run test -- --run src/App.test.tsx
```
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add frontend/src/App.test.tsx frontend/src/lib/types.ts frontend/src/App.tsx frontend/src/components/GenerationHistoryPanel.tsx frontend/src/components/WorkspacePanel.tsx frontend/src/styles.css

git commit -m "feat: show the active generation in history"
```

## Chunk 3: Full verification and branch handoff

### Task 3: Run the full suite and publish the branch

**Files:**
- Verify: `backend/tests`
- Verify: `frontend/src`

- [ ] **Step 1: Run the full project test suite**

Run:
```bash
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
```
Expected: backend and frontend suites both PASS.

- [ ] **Step 2: Inspect git status**

Run:
```bash
git status --short
```
Expected: only intended feature files are modified.

- [ ] **Step 3: Push the branch**

Run:
```bash
git push -u origin codex/active-generation-marker
```
Expected: branch published and ready for PR creation.
