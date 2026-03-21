# Apply Safety Validation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add preflight validation and structured apply issues so mixed file/change applies are safer and return clearer recovery guidance.

**Architecture:** Keep a single `/api/files/apply` flow, but split backend processing into validation and apply phases. Extend the shared apply result schema with `validated` items and structured `issues`, then update the frontend apply panel to render the richer result model.

**Tech Stack:** FastAPI, Pydantic, pytest, React 19, TypeScript, Vitest, Testing Library

---

## File Map

- Modify: `backend/app/models/schemas.py`
  - Add `ApplyIssue` and extend `ApplyResult`.
- Modify: `backend/app/services/workspace_fs.py`
  - Extract validation helpers and implement validation-first apply behavior.
- Modify: `backend/app/api/routes/files.py`
  - Return merged `validated` and `issues` for files plus changes.
- Modify: `backend/tests/test_workspace_fs.py`
  - Cover validation issues and mixed success/failure apply behavior.
- Modify: `backend/tests/test_apply_files_api.py`
  - Cover expanded apply response shape and mixed result attribution.
- Modify: `frontend/src/lib/types.ts`
  - Mirror `ApplyIssue` and expanded `ApplyResult` shape.
- Modify: `frontend/src/components/ApplyPanel.tsx`
  - Render validated count and structured issues.
- Modify: `frontend/src/App.test.tsx`
  - Cover validated count and structured issue rendering.

## Chunk 1: Backend Validation and Result Model

### Task 1: Extend schemas and workspace apply logic

**Files:**
- Modify: `backend/app/models/schemas.py`
- Modify: `backend/app/services/workspace_fs.py`
- Modify: `backend/tests/test_workspace_fs.py`

- [ ] **Step 1: Write the failing backend tests for validation issues**

In `backend/tests/test_workspace_fs.py`, add focused tests for:
- missing patch target file -> one `validation` issue with `kind == 'missing_target'`
- patch snippet mismatch -> one `validation` issue with `kind == 'snippet_not_found'`
- mixed valid + invalid selections -> valid item still applies, invalid item becomes an issue, and `validated` contains only the valid path

Sketch:

```python
def test_apply_changes_reports_validation_issue_for_missing_target(tmp_path: Path):
    result = apply_changes(
        str(tmp_path),
        [FileChangeDraft(path='backend/app/main.py', mode='patch', reason='x', old_snippet='old', new_content='new')],
    )

    assert result.validated == []
    assert result.applied_changes == []
    assert result.issues[0].stage == 'validation'
    assert result.issues[0].kind == 'missing_target'
```

- [ ] **Step 2: Run the focused backend test file to verify it fails**

Run: `powershell -Command "$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_workspace_fs.py -q"`
Expected: FAIL because `ApplyResult` and apply services do not yet expose `validated` or structured `issues`.

- [ ] **Step 3: Implement minimal schema support**

In `backend/app/models/schemas.py`:
- Add `ApplyIssue` with:
  - `path: str`
  - `stage: Literal['validation', 'apply']`
  - `kind: str`
  - `message: str`
  - `suggestion: str`
- Extend `ApplyResult` with:
  - `validated: list[str] = Field(default_factory=list)`
  - `issues: list[ApplyIssue] = Field(default_factory=list)`
- Keep existing fields for backward-compatible success counting.

- [ ] **Step 4: Implement minimal validation-first apply helpers**

In `backend/app/services/workspace_fs.py`:
- Add small validation helpers for:
  - file draft path validation
  - change target existence
  - patch snippet match validation
- Convert `apply_files(...)` to:
  - collect `validated` items first
  - apply only validated selected items
  - return `ApplyResult(validated=..., applied=..., applied_files=..., skipped=..., issues=[...], errors=[])`
- Convert `apply_changes(...)` similarly:
  - create `ApplyIssue` entries instead of raising on expected per-item validation failures
  - continue processing other selected items
- Only use `stage='apply'` when an actual write attempt fails after validation.

Keep the implementation intentionally small and deterministic.

- [ ] **Step 5: Run focused backend tests until green**

Run: `powershell -Command "$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_workspace_fs.py -q"`
Expected: PASS.

- [ ] **Step 6: Commit the backend service slice**

```bash
git add backend/app/models/schemas.py backend/app/services/workspace_fs.py backend/tests/test_workspace_fs.py
git commit -m "feat: validate apply targets before writing"
```

## Chunk 2: API Merge Behavior and Frontend Rendering

### Task 2: Surface validated items and issues end-to-end

**Files:**
- Modify: `backend/app/api/routes/files.py`
- Modify: `backend/tests/test_apply_files_api.py`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/components/ApplyPanel.tsx`
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing API and frontend expectations**

Add or update tests for:
- `backend/tests/test_apply_files_api.py`
  - assert mixed apply returns `validated` and `issues`
  - assert issue path and kind are preserved
- `frontend/src/App.test.tsx`
  - mock an apply response that includes:

```ts
{
  validated: ['README.md'],
  applied: ['README.md'],
  applied_files: ['README.md'],
  applied_changes: [],
  skipped: [],
  issues: [
    {
      path: 'backend/app/main.py',
      stage: 'validation',
      kind: 'snippet_not_found',
      message: 'Generated patch no longer matches the current file content.',
      suggestion: 'Regenerate this change or preview the latest file state before applying again.',
    },
  ],
  errors: [],
}
```

Then assert the UI shows:
- `Validated: 1`
- the failing path
- the message
- the suggestion

- [ ] **Step 2: Run focused backend and frontend tests to verify they fail**

Run backend: `powershell -Command "$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_apply_files_api.py -q"`
Run frontend: `cmd /c npm run test -- --run src/App.test.tsx`
Expected: FAIL because the API route and frontend types/UI do not yet support `validated` or structured `issues`.

- [ ] **Step 3: Implement minimal API result merging**

In `backend/app/api/routes/files.py`:
- Merge `validated`, `applied*`, `skipped`, `issues`, and `errors` from the file and change results.
- Preserve the current response envelope shape.

- [ ] **Step 4: Implement minimal frontend result support**

In `frontend/src/lib/types.ts`:
- Add `ApplyIssue`
- Extend `ApplyResult` with `validated` and `issues`

In `frontend/src/components/ApplyPanel.tsx`:
- Add `Validated: {applyResult.validated.length}` to the summary
- Replace the simple error count-only view with a small issue list that renders:
  - path
  - message
  - suggestion
- Keep existing applied/skipped counts visible
- Continue to display `applyErrorMessage` for envelope-level failures

Avoid changing `App.tsx` unless required by type updates.

- [ ] **Step 5: Run focused regression tests**

Run backend: `powershell -Command "$env:PYTHONPATH='backend'; python -m pytest backend/tests/test_apply_files_api.py -q"`
Run frontend: `cmd /c npm run test -- --run src/App.test.tsx src/components/ArtifactPanel.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run the full project test suite**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend suites PASS with the expanded apply result behavior.

- [ ] **Step 7: Commit the API/UI slice**

```bash
git add backend/app/api/routes/files.py backend/tests/test_apply_files_api.py frontend/src/lib/types.ts frontend/src/components/ApplyPanel.tsx frontend/src/App.test.tsx
git commit -m "feat: surface apply validation issues"
```

## Notes for the Implementer

- Keep the user interaction model unchanged: one apply button, no explicit dry-run button.
- Continue processing valid selected items even when some selections fail validation.
- Reserve `errors` for legacy compatibility or envelope-level failures; use `issues` for structured per-item reporting.
- Prefer extracting small validation helpers over duplicating path and patch checks between validation and apply code.
- Keep suggestions short and actionable.

## Verification Checklist

Before calling the work complete, confirm all of the following:

- invalid patch/file selections become `issues` instead of uncaught apply failures
- validated items are counted separately from applied items
- valid items still apply when neighboring items fail validation
- frontend summary shows validated count and issue details
- `powershell -ExecutionPolicy Bypass -File scripts/test.ps1` passes in the worktree
