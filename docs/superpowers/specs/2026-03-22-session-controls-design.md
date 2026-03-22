# Session Controls Design

## Summary

TradePilot AI now restores the latest local session on startup, but the workspace form still lacks two practical controls:

- a quick way to reuse recently restored workspace paths
- a clear way to reset the saved local session and return to a blank state

This slice adds lightweight session controls around the new persistence flow so the tool feels easier to steer after state restoration.

## Goals

- Surface `recent_workspaces` as quick-select controls in the workspace panel.
- Add a local "clear saved session" action.
- Keep all behavior local-only and single-user.
- Reuse the existing persisted session snapshot instead of introducing a new store.

## Non-Goals

- Multi-user session management
- Session history browsing
- Undo for cleared sessions
- Saved prompt history
- Cloud sync

## User Experience

### Recent workspaces

- When a restored or newly generated session includes recent workspaces, the workspace panel shows them as quick-select chips or buttons.
- Clicking one fills the `Workspace Path` field immediately.
- The control should remain lightweight and optional. If there are no recent workspaces, nothing extra is shown.

### Clear saved session

- The workspace panel shows a `Clear Saved Session` action.
- Clicking it clears the persisted session snapshot on the backend.
- The frontend returns to the blank login flow.
- Any loaded artifact and apply result disappear because the session has been reset.

## Backend Design

### New endpoint

Add:

- `DELETE /api/session`

Behavior:

- resets the stored session snapshot to the default empty state
- removes or overwrites `.local/session.json`
- returns the default empty snapshot in the same envelope shape as `GET /api/session`

### Session store

Extend `SessionStore` with:

- `clear()`

Behavior:

- reset in-memory state to the default snapshot
- remove the persisted file if it exists, or overwrite it with the default snapshot

## Frontend Design

### Workspace panel

Add two new UI elements:

- `Recent Workspaces`
  - rendered only when the restored session has one or more entries
  - each entry is clickable and fills the workspace path input

- `Clear Saved Session`
  - available while in the workspace screen
  - calls the new backend delete endpoint

### App state

When the clear action succeeds:

- reset display name
- reset screen to `login`
- clear workspace path and goal
- clear artifact
- clear apply result
- clear file/change selections
- clear rewrite preview state

## Error Handling

- If clearing the session fails, keep the current UI state and show a non-blocking error message.
- If recent workspaces are malformed or missing, the workspace panel simply omits them.

## Testing Strategy

### Backend

- `DELETE /api/session` returns the default snapshot
- clearing removes persisted state from subsequent `GET /api/session`

### Frontend

- restored recent workspaces render in the workspace panel
- clicking a recent workspace fills the workspace path field
- clearing the saved session returns the app to the login screen
- clearing the saved session removes the restored artifact from view

## Expected Outcome

After this slice, restored sessions will be easier to work with: users can quickly jump back to a recent workspace and can explicitly reset the local app state when they want a clean start.
