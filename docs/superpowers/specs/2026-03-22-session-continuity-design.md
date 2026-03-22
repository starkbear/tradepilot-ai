# Session Continuity Design

## Summary

TradePilot AI already supports local login, artifact generation, file application, and change previews, but the current session is entirely in-memory on the frontend. Refreshing the page drops the display name, workspace path, goal, generated artifact, selected files, selected changes, and last apply result.

This slice adds lightweight session continuity for the single-user local tool:

- persist the latest local workspace session on the backend
- restore it when the frontend boots
- keep the persistence scope intentionally small and local-only

The goal is not multi-user history or long-term project memory. The goal is that a user can reload the app and continue from where they left off.

## Goals

- Preserve the latest local session across page refreshes and app restarts.
- Restore enough state for the user to continue working immediately.
- Reuse the existing single-user local session model.
- Keep implementation local, file-based, and easy to reason about.

## Non-Goals

- Multi-user accounts
- Cross-device sync
- Full conversation history
- Versioned artifact history
- Background autosave of every keystroke
- Database adoption

## User Experience

### On first use

- The app behaves as it does today.
- After the user logs in, generates an artifact, or applies files, the latest state is saved.

### On reload

- The frontend requests the persisted local session during startup.
- If a saved session exists, the app restores:
  - display name
  - current screen
  - workspace path
  - latest goal
  - latest generated artifact
  - latest selected files and selected changes
  - latest apply result
- The user lands back in the workspace with the prior artifact visible instead of returning to a blank login screen.

### On partial or missing state

- If no persisted session exists, the app falls back to the current blank login flow.
- If persisted state is malformed or incomplete, the backend returns a safe default session and the frontend still loads.

## Data Model

Add a persisted local session snapshot that extends the current in-memory session concept.

Suggested shape:

- `display_name`
- `recent_workspaces`
- `preferred_provider`
- `screen`
- `workspace_path`
- `goal`
- `artifact`
- `selected_file_paths`
- `selected_change_paths`
- `selected_file_path`
- `selected_change_path`
- `apply_result`

This should remain a single snapshot, not a list of historical sessions.

## Storage Strategy

Use a small JSON file inside the repo-local `.local/` directory and ignore it in git.

Suggested file:

- `.local/session.json`

Rationale:

- keeps the MVP local and simple
- avoids introducing a database
- keeps writes inside the project workspace
- avoids storing user state in tracked source files

## Backend Design

### Session store

Upgrade `session_store.py` from pure in-memory state to a tiny read/write persistence layer.

Responsibilities:

- load snapshot from `.local/session.json` on startup
- return a safe default when no snapshot exists
- save snapshot after state changes

### New route

Add:

- `GET /api/session`

Response:

- current persisted local session snapshot

### Existing routes

Update these flows to persist the session:

- `POST /api/auth/login`
  - save updated `display_name`
  - set screen to `workspace`

- `POST /api/chat/generate`
  - save `workspace_path`
  - save `goal`
  - save `artifact`
  - reset selection state to the new artifact defaults
  - clear stale apply result

- `POST /api/files/apply`
  - save latest `apply_result`
  - preserve existing artifact and selection state

## Frontend Design

### Startup restore

On app mount:

- request `GET /api/session`
- hydrate the app state from the returned snapshot

### State ownership

Keep `App.tsx` as the state coordinator, but initialize it from the restored backend snapshot instead of always starting from empty values.

### Save triggers

Avoid adding separate frontend persistence logic. Let the backend persist after meaningful actions:

- login
- generate
- apply

This keeps the browser client simpler and avoids sync drift between frontend local state and backend state.

## Error Handling

- If loading the persisted session fails, frontend falls back to blank login state and shows no blocking error.
- If the session file is missing, backend returns a default empty session.
- If the session file is corrupt, backend should ignore the bad snapshot and return a default empty session.

## Testing Strategy

### Backend

- session store loads default state when no file exists
- session store persists and reloads a saved snapshot
- `GET /api/session` returns persisted state
- login/generate/apply routes update persisted session as expected

### Frontend

- app restores workspace state from `GET /api/session`
- app stays on login screen when restored session is empty
- restored artifact is rendered without a new generate request
- restored apply result is shown when present

## Implementation Boundary

This slice should only add continuity for the latest local session snapshot.

It should not introduce:

- session history lists
- artifact history browsing
- autosave on every field change
- merge/conflict logic for concurrent clients

## Expected Outcome

After this slice, TradePilot AI will feel like a persistent local workspace instead of a disposable page session. Reloading the app will restore the user's latest working context so they can continue generating and applying changes without rebuilding state from scratch.
