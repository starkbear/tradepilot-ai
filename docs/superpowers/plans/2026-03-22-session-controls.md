# Session Controls Implementation Plan

## Goal

Add lightweight controls around the restored local session so users can quickly reuse recent workspaces and explicitly clear the saved session.

## Scope

- add `DELETE /api/session`
- extend the session store with `clear()`
- show recent workspace shortcuts in the workspace panel
- add a `Clear Saved Session` action that resets the app to the blank login state

## Chunk 1: Backend session clearing

### Tasks

1. Add `clear()` to the session store.
2. Add `DELETE /api/session`.
3. Cover clear-and-reload behavior with backend tests.

### Verification

- focused backend session API/store tests

## Chunk 2: Frontend session controls

### Tasks

1. Extend the frontend API layer with session delete support.
2. Surface `recent_workspaces` in `WorkspacePanel`.
3. Add `Clear Saved Session` and reset the app state on success.
4. Cover recent-workspace selection and clear-session behavior in app tests.

### Verification

- focused frontend app/component tests
- full `scripts/test.ps1`
