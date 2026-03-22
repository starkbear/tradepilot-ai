# Session Continuity Implementation Plan

## Goal

Persist the latest local workspace session and restore it on app startup so the user can continue from the last generated state after a reload.

## Scope

- persist a single local session snapshot to `.local/session.json`
- add `GET /api/session`
- update login, generate, and apply flows to save session state
- hydrate frontend state from the persisted snapshot on boot
- keep all behavior local-only and single-user

## Chunk 1: Backend persistence and session API

### Tasks

1. Expand backend session models to include a persisted workspace snapshot.
2. Upgrade `session_store.py` to load/save `.local/session.json`.
3. Add `GET /api/session`.
4. Persist session updates from login, generate, and apply flows.

### Verification

- focused backend tests for session store and session API
- existing auth/chat/apply API tests still pass

## Chunk 2: Frontend restore flow

### Tasks

1. Add session fetch helper in the frontend API layer.
2. Hydrate `App.tsx` from the persisted session on mount.
3. Restore artifact, selected files/changes, and apply result from the returned snapshot.
4. Preserve current blank-login behavior when no saved session exists.

### Verification

- focused frontend tests for startup restore and blank fallback
- full `scripts/test.ps1`

## Notes

- Do not add browser-only localStorage persistence.
- Do not add session history or multiple saved workspaces.
- Keep persisted state conservative and schema-driven.
