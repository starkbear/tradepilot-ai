# Apply Files Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users keep all generated files selected by default, uncheck any subset, apply the selected files into the workspace, and see a clear apply-result summary in the UI.

**Architecture:** Keep the existing `/api/files/apply` contract and current backend overwrite behavior. Extend the frontend state flow in `App.tsx`, add a focused apply-results panel, and wire the artifact file list to a checkbox-based selection model.

**Tech Stack:** React, TypeScript, Vitest, FastAPI, Pydantic.

---

## File Structure Map

- Modify: `frontend/src/App.tsx`
  Owns selected-file state, apply action state, and result-summary state.
- Modify: `frontend/src/components/ArtifactPanel.tsx`
  Adds checkbox controls for file selection and renders the apply controls.
- Create: `frontend/src/components/ApplyPanel.tsx`
  Shows selected count, apply button, loading state, and apply result summary.
- Modify: `frontend/src/lib/api.ts`
  Adds the frontend helper for `/api/files/apply`.
- Modify: `frontend/src/lib/types.ts`
  Adds apply-result types for API and UI state.
- Modify: `frontend/src/App.test.tsx`
  Covers default selection, deselection, and apply summary rendering.
- Modify: `backend/tests/test_files_apply_api.py`
  Adds a narrow regression that confirms overwrite behavior remains allowed.

## Chunk 1: Frontend Apply Flow Contract

### Task 1: Add failing frontend tests first

**Files:**
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/lib/types.ts`

- [ ] **Step 1: Write a failing test that generated files are selected by default**

- [ ] **Step 2: Write a failing test that deselecting one file excludes it from the apply request**

- [ ] **Step 3: Write a failing test that a successful apply shows the applied/skipped/errors summary**

- [ ] **Step 4: Run `cmd /c npm run test -- --run src/App.test.tsx` and confirm the new tests fail for missing apply-flow behavior**

## Chunk 2: Frontend Implementation

### Task 2: Implement file selection and apply-result UI

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/ArtifactPanel.tsx`
- Create: `frontend/src/components/ApplyPanel.tsx`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/types.ts`

- [ ] **Step 1: Add apply-result and selected-file-path state in `App.tsx`**

- [ ] **Step 2: Default all artifact files to selected after each successful generation**

- [ ] **Step 3: Reset previous apply results when a new artifact is generated**

- [ ] **Step 4: Add an `applyFiles()` API helper in `frontend/src/lib/api.ts`**

- [ ] **Step 5: Create `ApplyPanel.tsx` to render selected count, apply action, and result summary**

- [ ] **Step 6: Extend `ArtifactPanel.tsx` to render checkboxes and call selection handlers**

- [ ] **Step 7: Wire `Apply Selected Files` to send only selected files**

- [ ] **Step 8: Run `cmd /c npm run test -- --run src/App.test.tsx` and confirm green**

## Chunk 3: Backend Regression Coverage

### Task 3: Confirm overwrite behavior remains stable

**Files:**
- Modify: `backend/tests/test_files_apply_api.py`

- [ ] **Step 1: Write a failing test that applying a file overwrites existing contents**

- [ ] **Step 2: Run `python -m pytest backend/tests/test_files_apply_api.py -q` and confirm the new assertion fails or is unverified**

- [ ] **Step 3: Make the minimal backend adjustment only if the test proves it is needed**

- [ ] **Step 4: Run `python -m pytest backend/tests/test_files_apply_api.py -q` and confirm green**

## Chunk 4: Full Verification

### Task 4: Verify the full apply-files slice end to end

**Files:**
- Verify only

- [ ] **Step 1: Run `python -m pytest backend/tests -q`**

- [ ] **Step 2: Run `cmd /c npm run test -- --run` in `frontend/`**

- [ ] **Step 3: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**

- [ ] **Step 4: Manually verify the browser flow: generate -> deselect a file -> apply selected files -> check summary**
