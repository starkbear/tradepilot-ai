# Generation History Implementation Plan

## Goal

Persist a short local history of recent generated artifacts and let the user restore an earlier generation into the active workspace state.

## Scope

- add persisted generation history entries to the session snapshot
- store recent generations when generation succeeds
- add a backend restore endpoint for a chosen history entry
- render generation history in the frontend
- restore a prior artifact without breaking preview/apply flows

## Chunk 1: Backend generation history

### Tasks

1. Add `GenerationHistoryEntry` and restore request models.
2. Extend the persisted session snapshot with `generation_history`.
3. Update the session store to append and cap history entries on generate.
4. Add `POST /api/session/restore-generation`.
5. Add backend tests for history creation, capping, restore success, and restore failure.

### Verification

- focused backend session and chat tests

## Chunk 2: Frontend generation history

### Tasks

1. Extend frontend session types and API calls to include history and restore support.
2. Add a compact generation history panel in the workspace area.
3. Restore a selected history entry into the active artifact state.
4. Clear stale apply result state on restore.
5. Add frontend tests for history rendering, restore success, and restore failure behavior.

### Verification

- focused frontend app tests
- full `scripts/test.ps1`
