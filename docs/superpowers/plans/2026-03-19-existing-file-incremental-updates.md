# Existing File Incremental Updates Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let generated artifacts include structured updates for existing files and allow users to preview, select, and safely apply those changes alongside new files.

**Architecture:** Extend the shared artifact and apply models with a separate `changes[]` channel for existing-file updates. Keep the current preview-first flow, add strict backend change-application rules for `patch` and `rewrite`, then wire the frontend to preview and submit mixed new-file and existing-file changes through the existing apply action.

**Tech Stack:** FastAPI, Pydantic, pathlib, React, TypeScript, Vitest, pytest.

---

## File Structure Map

- Modify: `backend/app/models/schemas.py`
  Adds `FileChangeDraft`, extends `GenerationArtifact`, `ApplyFilesRequest`, and `ApplyResult` as needed.
- Modify: `backend/app/services/artifacts.py`
  Ensures normalization continues to validate core artifact structure while supporting `changes[]`.
- Modify: `backend/app/services/workspace_fs.py`
  Adds strict apply logic for `patch` and `rewrite` changes while preserving workspace path safety.
- Modify: `backend/app/api/routes/files.py`
  Accepts mixed `files + changes` apply payloads.
- Modify: `backend/tests/test_artifacts.py`
  Adds validation coverage for the new `changes[]` channel.
- Create: `backend/tests/test_workspace_fs.py`
  Covers patch success/failure, rewrite behavior, and workspace boundary enforcement.
- Modify: `backend/tests/test_chat_generate_api.py`
  Verifies generation can return `changes[]` without breaking the response contract.
- Create: `backend/tests/test_apply_files_api.py`
  Verifies mixed apply requests for new files and existing-file changes.
- Modify: `frontend/src/lib/types.ts`
  Adds frontend types for existing-file change drafts and expanded apply results.
- Modify: `frontend/src/lib/api.ts`
  Sends `changes[]` in apply requests and consumes the expanded artifact shape.
- Modify: `frontend/src/App.tsx`
  Tracks selected change drafts, preview state, and mixed apply submissions.
- Modify: `frontend/src/components/ArtifactPanel.tsx`
  Renders the new Existing File Changes section and forwards preview/toggle actions.
- Modify: `frontend/src/components/ApplyPanel.tsx`
  Updates selection counts and summary copy to cover both files and changes if needed.
- Create: `frontend/src/components/ChangePreview.tsx`
  Displays `patch` and `rewrite` previews in a focused, reusable component.
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
  Verifies change rendering and preview behavior.
- Modify: `frontend/src/App.test.tsx`
  Verifies default selection, deselection, and mixed apply submission behavior.

## Chunk 1: Backend Models and Apply Engine

### Task 1: Add strict change-draft models and change application behavior

**Files:**
- Modify: `backend/app/models/schemas.py`
- Modify: `backend/app/services/artifacts.py`
- Modify: `backend/app/services/workspace_fs.py`
- Modify: `backend/tests/test_artifacts.py`
- Create: `backend/tests/test_workspace_fs.py`

- [ ] **Step 1: Write a failing artifact test that `changes[]` validates `patch` and `rewrite` change drafts**

Add a test that builds a generation payload with valid `changes[]` entries and asserts `normalize_generation(...)` returns a valid artifact with both change modes preserved.

- [ ] **Step 2: Write a second failing artifact test that malformed change drafts still fail validation**

Cover at least one invalid shape such as a `patch` change missing `old_snippet` or a change using an unsupported `mode`.

- [ ] **Step 3: Run the focused artifact tests to verify the new tests fail for the expected schema reasons**

Run: `python -m pytest backend/tests/test_artifacts.py -q`
Expected: failures because the current schema does not include `changes[]`.

- [ ] **Step 4: Write failing workspace filesystem tests for patch success, patch failure, and rewrite success**

Create tests that:
- replace an exact snippet in an existing file
- fail when `old_snippet` is missing from the file
- overwrite an existing file in `rewrite` mode
- still reject paths outside the workspace

- [ ] **Step 5: Run the new workspace filesystem tests and confirm they fail before implementation**

Run: `python -m pytest backend/tests/test_workspace_fs.py -q`
Expected: failure because change application support does not exist yet.

- [ ] **Step 6: Implement the minimal backend model and apply-engine changes**

Update `schemas.py` to add:
- `FileChangeDraft`
- `GenerationArtifact.changes`
- `ApplyFilesRequest.changes`
- any minimally necessary `ApplyResult` expansion or continue using the existing arrays if tests support that shape

Update `workspace_fs.py` to add strict helpers such as:
- `apply_changes(...)`
- exact one-match patch replacement by default
- rewrite support for existing files only
- unchanged path-boundary enforcement

Update `artifacts.py` only as needed so `changes[]` validates without weakening existing strictness.

- [ ] **Step 7: Run the focused backend tests and confirm green**

Run: `python -m pytest backend/tests/test_artifacts.py backend/tests/test_workspace_fs.py -q`
Expected: all new backend model/apply tests pass.

- [ ] **Step 8: Commit the backend model and apply-engine changes**

```bash
git add backend/app/models/schemas.py backend/app/services/artifacts.py backend/app/services/workspace_fs.py backend/tests/test_artifacts.py backend/tests/test_workspace_fs.py
git commit -m "feat: add existing file change drafts"
```

## Chunk 2: Backend API Contract for Mixed Apply Requests

### Task 2: Extend generation and apply APIs to carry change drafts

**Files:**
- Modify: `backend/app/api/routes/files.py`
- Modify: `backend/tests/test_chat_generate_api.py`
- Create: `backend/tests/test_apply_files_api.py`

- [ ] **Step 1: Write a failing generation API test that a response including `changes[]` is accepted and returned intact**

Update the fake provider response in `test_chat_generate_api.py` to include at least one valid change draft and assert the API response includes it.

- [ ] **Step 2: Run the generation API tests and verify the new test fails for the expected contract reason**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: failure because the current response schema does not yet include `changes[]`.

- [ ] **Step 3: Write a failing apply API test for mixed `files + changes` payloads**

Create `backend/tests/test_apply_files_api.py` with a test that submits:
- one new file draft
- one patch change draft
- one rewrite change draft

Assert the API applies the selected items and returns a stable summary shape.

- [ ] **Step 4: Run the new apply API tests and verify they fail before route changes**

Run: `python -m pytest backend/tests/test_apply_files_api.py -q`
Expected: failure because the route/request model does not yet support `changes[]`.

- [ ] **Step 5: Implement the minimal API changes**

Update `files.py` so `/api/files/apply` accepts mixed payloads and routes `changes[]` into the workspace apply service before `files[]`.

Keep the response envelope stable for the frontend. If `ApplyResult` is expanded, update the tests accordingly.

- [ ] **Step 6: Run focused API tests and confirm green**

Run: `python -m pytest backend/tests/test_chat_generate_api.py backend/tests/test_apply_files_api.py -q`
Expected: API generation/apply tests pass.

- [ ] **Step 7: Commit the API contract updates**

```bash
git add backend/app/api/routes/files.py backend/tests/test_chat_generate_api.py backend/tests/test_apply_files_api.py
# Include any schema file updates from this chunk.
git commit -m "feat: support mixed file and change apply requests"
```

## Chunk 3: Frontend Preview, Selection, and Mixed Apply Flow

### Task 3: Show existing-file changes in the UI and submit selected mixed changes

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/ArtifactPanel.tsx`
- Create: `frontend/src/components/ChangePreview.tsx`
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write a failing component test that `ArtifactPanel` renders an Existing File Changes section**

Add a test with an artifact containing one `patch` change and one `rewrite` change. Assert the new section appears and both changes are listed.

- [ ] **Step 2: Write a failing component test for change preview rendering**

Assert clicking a change shows the correct preview details for `patch` (`old_snippet` + `new_content`) and for `rewrite` (full replacement content).

- [ ] **Step 3: Run the focused component tests and verify they fail before UI implementation**

Run: `cmd /c npm run test -- --run src/components/ArtifactPanel.test.tsx`
Expected: failures because `changes[]` UI does not yet exist.

- [ ] **Step 4: Write a failing app test for mixed apply submission**

Update `App.test.tsx` so a successful generation returns both `files[]` and `changes[]`. Deselect one change, apply, and assert the request body includes only the still-selected file and change drafts.

- [ ] **Step 5: Run the focused app test and verify it fails before implementation**

Run: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: failure because the app only tracks file selections today.

- [ ] **Step 6: Implement the minimal frontend changes**

Update frontend types and API helpers to carry `changes[]`.

Update `App.tsx` to manage:
- selected change paths
- preview target for either a file or a change
- mixed apply submission containing selected files and changes
- reset behavior on regeneration

Update `ArtifactPanel.tsx` to render the new change section and preview entry point.

Add `ChangePreview.tsx` to keep change-display logic isolated.

- [ ] **Step 7: Run focused frontend tests and confirm green**

Run:
- `cmd /c npm run test -- --run src/components/ArtifactPanel.test.tsx`
- `cmd /c npm run test -- --run src/App.test.tsx`

Expected: both focused frontend suites pass.

- [ ] **Step 8: Run full project verification**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend test suites both pass.

- [ ] **Step 9: Perform one manual smoke check if environment allows**

Trigger a local browser or API flow that includes at least one existing-file change and confirm preview plus apply behavior works, or record the exact remaining issue if the environment blocks it.

- [ ] **Step 10: Commit the frontend mixed apply flow**

```bash
git add frontend/src/lib/types.ts frontend/src/lib/api.ts frontend/src/App.tsx frontend/src/components/ArtifactPanel.tsx frontend/src/components/ChangePreview.tsx frontend/src/components/ArtifactPanel.test.tsx frontend/src/App.test.tsx
git commit -m "feat: preview and apply existing file changes"
```
