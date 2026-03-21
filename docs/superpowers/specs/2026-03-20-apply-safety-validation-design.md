# Apply Safety Validation Design

Date: 2026-03-20

## Summary

Strengthen the mixed file/change apply flow by introducing an internal validation phase before writes occur, and return clearer structured issues for both validation failures and apply-time failures. The user experience remains a single `Apply Selected Files` action, but the result becomes more informative and safer.

## Goals

- Validate each selected file or change before writing it to disk.
- Prevent invalid patch or path operations from reaching the write phase.
- Return clear, structured issue information to the frontend.
- Let valid items continue applying even when some selected items fail validation.
- Improve user guidance when patch application fails because the target file changed.

## Non-Goals

- No separate `Validate Changes` button in the UI.
- No transaction rollback or all-or-nothing apply semantics.
- No automatic conflict resolution or patch repair.
- No three-way merge, diff editor, or regeneration workflow in this slice.

## User Experience

The user continues to click a single `Apply Selected Files` button.

Internally, the backend performs two stages:

1. Validation stage
   - Check each selected item without writing.
2. Apply stage
   - Apply only the items that passed validation.

The result panel becomes more descriptive:

- `Validated`: items that passed preflight validation.
- `Applied`: items successfully written.
- `Skipped`: items intentionally not written.
- `Issues`: structured problems that explain what failed, at which stage, and what the user should do next.

Example improvement over current behavior:
- Instead of only reporting `patch old_snippet not found`, the UI can tell the user that the file has likely changed since generation and suggest regenerating or re-previewing the change.

## Recommended Approach

### Option 1: Minimal backend message improvement

Keep the same apply flow and only replace generic string errors with better messages.

Pros:
- Very small change.

Cons:
- No preflight separation.
- Frontend still cannot distinguish validation failures from write failures.

### Option 2: Structured preflight validation inside apply

Add an internal validation pass before writing, extend the apply result with `validated` items and structured `issues`, and keep the UI to one apply button.

Pros:
- Stronger safety.
- Clearer user feedback.
- No new user-facing workflow complexity.

Cons:
- Slightly larger API contract update.

Recommended.

### Option 3: Transaction-style staged apply

Implement full staging and rollback semantics.

Pros:
- Strongest consistency guarantees.

Cons:
- Too large for this slice.
- Adds significant complexity relative to current needs.

## Backend Design

### Validation phase

Before writing any selected item, validate each entry independently.

For files:
- Path must remain within workspace.
- Destination path must be valid.

For changes:
- Path must remain within workspace.
- `patch` target file must exist.
- `patch.old_snippet` must match the current file content.
- `rewrite` target path must be valid and writable.

Validation should not write or mutate any file.

### Apply phase

Only validated items continue to write operations.

This slice uses per-item processing:
- Validation failures do not block all other items.
- Successfully validated items still apply.
- No rollback is attempted if a later write fails.

## Result Model

Introduce a structured issue model.

### ApplyIssue

Suggested fields:
- `path`
- `stage`
  - `validation` or `apply`
- `kind`
  - examples: `missing_target`, `snippet_not_found`, `path_outside_workspace`, `write_failed`
- `message`
- `suggestion`

### ApplyResult updates

Extend the existing response with:
- `validated: string[]`
- `issues: ApplyIssue[]`

Keep existing fields such as:
- `applied`
- `applied_files`
- `applied_changes`
- `skipped`

This keeps the frontend contract evolutionary rather than replacing the whole response shape.

## Frontend Design

The frontend keeps one apply button and one result panel.

### Result summary additions

Add support for:
- `Validated`
- `Applied`
- `Skipped`
- `Issues`

### Issue rendering

Each issue should show:
- target path
- clear message
- suggested next action

Suggested examples:
- `backend/app/main.py`
- `Validation: generated patch no longer matches the current file content.`
- `Suggestion: regenerate this change or preview the latest file state before applying again.`

No additional user interaction or confirmation step is added in this slice.

## Testing Strategy

### Backend service tests

Add coverage for:
- patch target file missing -> validation issue
- patch snippet not found -> validation issue
- path outside workspace -> validation issue
- validated items still apply successfully
- mixed success/failure selections only apply validated items

### API tests

Add coverage for:
- `/api/files/apply` returns `validated`
- `/api/files/apply` returns structured `issues`
- mixed file and change submissions produce correctly attributed issues

### Frontend tests

Add coverage for:
- result summary shows validated count
- structured issues render path, message, and suggestion
- existing success-path apply tests continue to pass

## Risks and Mitigations

### Risk: Apply result becomes harder to consume

Mitigation:
- Keep the top-level shape close to the existing `ApplyResult`.
- Add `validated` and `issues` without removing current success fields.

### Risk: Users expect all-or-nothing safety

Mitigation:
- Keep behavior explicit: items validate and apply independently.
- Surface per-item results clearly in the UI.

### Risk: Validation logic duplicates apply logic

Mitigation:
- Extract reusable checks so validation and apply use the same path and patch assumptions.
- Keep validation narrow and deterministic.

## Implementation Boundary

This spec covers:
- backend preflight validation inside the existing apply route
- structured apply issues
- frontend result rendering updates
- related backend and frontend tests

This spec does not cover:
- transaction rollback
- separate validation endpoints or buttons
- automatic patch repair
- merge tooling

## Expected Outcome

After this change, applying generated files and existing-file changes becomes safer and more understandable. Invalid items are caught before writes, valid items still proceed, and the UI explains failures with enough context for the user to recover confidently.
