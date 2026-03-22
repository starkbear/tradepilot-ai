# Rewrite Diff Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a readable diff preview for `rewrite`-mode existing file changes by loading current file contents on demand and comparing them against the generated replacement.

**Architecture:** Add a thin backend file-read endpoint that safely returns current workspace file contents for a single path. In the frontend, fetch current file content only for the selected rewrite change, render a lightweight diff-style preview when available, and fall back to raw replacement content when the file cannot be loaded.

**Tech Stack:** FastAPI, Pydantic, pytest, React 19, TypeScript, Vitest, Testing Library

---

## File Map

- Modify: `backend/app/models/schemas.py`
  - Add request/response models for file-content preview reads.
- Modify: `backend/app/api/routes/files.py`
  - Add `POST /api/files/read`.
- Create: `backend/tests/test_read_file_api.py`
  - Cover valid read, missing file, and out-of-workspace rejection.
- Modify: `frontend/src/lib/api.ts`
  - Add a helper to request current file content for rewrite previews.
- Modify: `frontend/src/App.tsx`
  - Track current-file preview state for the selected rewrite change and fetch it on selection.
- Modify: `frontend/src/components/ChangePreview.tsx`
  - Accept loaded current content and render either rewrite diff or fallback preview.
- Create: `frontend/src/components/RewriteDiffPreview.tsx`
  - Render a lightweight unified diff for full-file rewrites.
- Create: `frontend/src/components/RewriteDiffPreview.test.tsx`
  - Cover diff rendering behavior for rewrite previews.
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
  - Assert rewrite selection still previews correctly once diff support is added.
- Modify: `frontend/src/App.test.tsx`
  - Cover successful rewrite current-content fetch and fallback behavior.

## Chunk 1: Backend File Read Endpoint

### Task 1: Add a safe current-file preview API

**Files:**
- Modify: `backend/app/models/schemas.py`
- Modify: `backend/app/api/routes/files.py`
- Create: `backend/tests/test_read_file_api.py`

- [ ] **Step 1: Write the failing API tests**

Create `backend/tests/test_read_file_api.py` with focused coverage for:
- reading a valid text file inside the workspace
- rejecting a missing file
- rejecting a path outside the workspace

Sketch:

```python
def test_read_file_returns_current_content(tmp_path: Path):
    target = tmp_path / 'frontend' / 'src' / 'App.tsx'
    target.parent.mkdir(parents=True)
    target.write_text('export function App() { return null }', encoding='utf-8')

    client = TestClient(app)
    response = client.post('/api/files/read', json={
        'workspace_path': str(tmp_path),
        'path': 'frontend/src/App.tsx',
    })

    assert response.status_code == 200
    assert response.json()['data']['content'] == 'export function App() { return null }'
```

- [ ] **Step 2: Run the focused backend test to verify it fails**

Run: `powershell -Command "$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_read_file_api.py -q"`
Expected: FAIL because `/api/files/read` does not exist yet.

- [ ] **Step 3: Implement minimal backend support**

In `backend/app/models/schemas.py`:
- add `ReadFileRequest` with `workspace_path` and `path`
- add `ReadFileResult` with `path` and `content`

In `backend/app/api/routes/files.py`:
- add `POST /read`
- validate the requested path with existing workspace path-safety logic
- reject missing or non-file targets with a clear API error
- read text as UTF-8 and return the envelope:

```python
{
  'success': True,
  'message': 'file loaded',
  'data': {'path': ..., 'content': ...},
  'errors': [],
}
```

Keep the endpoint intentionally narrow and text-only.

- [ ] **Step 4: Run focused backend tests until green**

Run: `powershell -Command "$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_read_file_api.py -q"`
Expected: PASS.

- [ ] **Step 5: Commit the backend read endpoint slice**

```bash
git add backend/app/models/schemas.py backend/app/api/routes/files.py backend/tests/test_read_file_api.py
git commit -m "feat: add rewrite preview file reads"
```

## Chunk 2: Frontend Rewrite Diff Preview

### Task 2: Fetch current file content and render rewrite diffs

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/ChangePreview.tsx`
- Create: `frontend/src/components/RewriteDiffPreview.tsx`
- Create: `frontend/src/components/RewriteDiffPreview.test.tsx`
- Modify: `frontend/src/components/ArtifactPanel.test.tsx`
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing frontend tests**

Add `frontend/src/components/RewriteDiffPreview.test.tsx` covering:
- unchanged and added lines
- removed lines
- full replacement with no shared context

Update `frontend/src/App.test.tsx` to cover:
- selecting a rewrite change triggers a file-read request
- when the read succeeds, the rewrite preview shows diff-style output
- when the read fails, the preview falls back to the raw `new_content` block

Keep the test setup minimal by stubbing sequential `fetch` calls.

- [ ] **Step 2: Run the focused frontend tests to verify they fail**

Run: `cmd /c npm run test -- --run src/components/RewriteDiffPreview.test.tsx src/App.test.tsx src/components/ArtifactPanel.test.tsx`
Expected: FAIL because rewrite diff preview and file-read fetching are not implemented yet.

- [ ] **Step 3: Implement minimal frontend support**

In `frontend/src/lib/api.ts`:
- add `readWorkspaceFile({ workspacePath, path })`

In `frontend/src/App.tsx`:
- add state for current rewrite preview content and load status
- when `selectedChangePath` points to a rewrite change, fetch the current file content
- clear preview state when selection changes away from rewrite or when no change is selected

In `frontend/src/components/RewriteDiffPreview.tsx`:
- render a unified diff view using the same lightweight line-prefix strategy as `PatchDiffPreview`
- extract a tiny shared diff utility if duplication becomes awkward; otherwise keep logic focused

In `frontend/src/components/ChangePreview.tsx`:
- accept optional `currentContent` and `currentContentStatus`
- `patch` -> keep `PatchDiffPreview`
- `rewrite` with loaded current content -> show `RewriteDiffPreview`
- `rewrite` without current content -> keep the existing raw `new_content` fallback preview

Make the fallback graceful rather than error-heavy.

- [ ] **Step 4: Run focused frontend regression tests**

Run: `cmd /c npm run test -- --run src/components/RewriteDiffPreview.test.tsx src/App.test.tsx src/components/ArtifactPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full project test suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend suites PASS with the new rewrite preview coverage included.

- [ ] **Step 6: Commit the frontend rewrite preview slice**

```bash
git add frontend/src/lib/api.ts frontend/src/App.tsx frontend/src/components/ChangePreview.tsx frontend/src/components/RewriteDiffPreview.tsx frontend/src/components/RewriteDiffPreview.test.tsx frontend/src/components/ArtifactPanel.test.tsx frontend/src/App.test.tsx backend/tests/test_read_file_api.py backend/app/models/schemas.py backend/app/api/routes/files.py
git commit -m "feat: preview rewrite diffs against current files"
```

## Notes for the Implementer

- Only fetch current content for the selected rewrite change, not for every change in the list.
- Keep read failures as a soft fallback, not a blocking UI error.
- Reuse existing workspace path safety rules in the backend.
- Do not change apply behavior in this slice.
- If a shared diff helper becomes necessary, keep it tiny and colocated with the preview components.

## Verification Checklist

Before calling the work complete, confirm all of the following:

- rewrite selections can load current file content on demand
- successful reads render diff-style rewrite previews
- failed reads fall back to raw replacement preview
- patch preview behavior remains unchanged
- `powershell -ExecutionPolicy Bypass -File scripts/test.ps1` passes in the worktree
