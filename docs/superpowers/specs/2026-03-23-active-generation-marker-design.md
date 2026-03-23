# Active Generation Marker Design

**Date:** 2026-03-23

## Goal

Make the generation history panel show which saved generation is currently active, so users can immediately tell which historical result their workspace is based on.

## Context

The history panel already supports:

- restoring past generations
- removing individual entries
- clearing all history
- previewing entry metadata and lightweight details

What is still missing is a clear sense of which history item is currently active. After a restore, the UI updates, but the history list itself does not mark the restored item. That makes it harder to reason about whether the current workspace state already matches a given history entry.

## Approaches Considered

### 1. Purely visual frontend heuristic

Infer the active entry by comparing the current artifact and goal against each history entry on the client.

**Pros**
- no backend changes
- fast to prototype

**Cons**
- fragile when artifacts are similar
- hard to keep stable across session restore, delete, and clear flows

### 2. Persist an explicit active generation id

Store `active_generation_id` in the persisted session snapshot, update it on generate/restore/delete/clear, and let the frontend render a stable active marker.

**Pros**
- explicit and reliable
- keeps logic simple on the frontend
- survives session reloads cleanly

**Cons**
- requires a small backend schema update

### 3. Derived active status with server-side comparison

Have the backend compute the active entry dynamically by comparing the current artifact to history entries when returning session data.

**Pros**
- keeps session snapshot schema unchanged

**Cons**
- unnecessary complexity for a simple state flag
- still relies on comparison heuristics

## Recommendation

Use **Approach 2**.

A persisted `active_generation_id` is the smallest reliable contract. It gives the frontend a stable signal, avoids brittle equality logic, and fits naturally into the existing session store design.

## Design

### Session Snapshot

Add a new field to the persisted session snapshot:

- `active_generation_id: string | null`

This field identifies the currently active history entry when one exists.

### Session Store Rules

Update session persistence rules as follows:

- after a new generation completes, set `active_generation_id` to the new history entry id
- after restoring a history entry, set `active_generation_id` to that entry id
- after deleting the active history entry, clear `active_generation_id`
- after clearing history, clear `active_generation_id`
- after clearing the whole session, `active_generation_id` returns to `null`

No attempt should be made to automatically select another active history item when the active one is deleted. First version should simply fall back to no active marker.

### History Panel UI

Each history entry should support an `isActive` state.

When active, the entry should show:

- a visible `Active` badge
- a slightly stronger card treatment so the active item is easier to scan
- a disabled restore button labeled `Current` instead of `Restore`

This keeps the action model clear: users can still preview or remove the active history entry, but they should not be encouraged to restore what is already active.

### Interaction Rules

- generating new output marks the newest history entry as active
- restoring a different entry moves the active marker to that entry
- deleting a non-active entry leaves the active marker unchanged
- deleting the active entry removes the marker entirely
- clearing history removes all markers
- loading a saved session restores the active marker automatically

## Components

### Backend

Update the session models and store logic in:

- `backend/app/models/schemas.py`
- `backend/app/services/session_store.py`
- any API tests that validate session snapshot payloads

### Frontend

Update the session type and history panel rendering in:

- `frontend/src/lib/types.ts`
- `frontend/src/App.tsx`
- `frontend/src/components/GenerationHistoryPanel.tsx`
- `frontend/src/components/WorkspacePanel.tsx`
- `frontend/src/styles.css`

## Error Handling

This feature does not add new API routes.

The only behavioral edge cases are:

- if `active_generation_id` points to an entry that no longer exists, the frontend should simply render no active marker
- deleting the active entry must not break the panel; it should only clear the marker

## Testing

### Backend tests

Add coverage for:

- new generation sets `active_generation_id`
- restore updates `active_generation_id`
- deleting the active entry clears `active_generation_id`
- deleting a non-active entry preserves `active_generation_id`
- clearing history clears `active_generation_id`

### Frontend tests

Add coverage for:

- session restore displays an active badge on the correct history entry
- the active entry shows `Current` instead of `Restore`
- restoring another entry moves the active badge
- deleting the active entry removes the badge
- deleting a non-active entry preserves the badge

## Non-Goals

This slice does not include:

- automatic fallback to another active entry after deletion
- server-side history ranking
- pinned history items
- multi-select history operations

## Expected Outcome

After this change, the history panel will clearly indicate which saved generation the current workspace is aligned with. That removes ambiguity after restores and makes the history list feel more like a true state timeline instead of a loose archive.
