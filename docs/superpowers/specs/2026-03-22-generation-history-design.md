# Generation History Design

## Summary

TradePilot AI currently keeps only one active generated artifact in the local session. When the user clicks `Generate Scaffold` again, the previous artifact is replaced immediately, which makes it hard to compare iterations, recover a better previous draft, or continue from an earlier generation.

This slice adds a lightweight local generation history:

- keep a small list of recent generated artifacts in the persisted session
- show them in the UI as selectable history entries
- let the user restore a prior artifact into the active workspace state

The goal is not full version control. The goal is to make iterative generation feel recoverable.

## Goals

- Persist a short history of recent generated artifacts.
- Let the user switch the active artifact to an earlier generation.
- Keep the feature local-only, single-user, and lightweight.
- Preserve the existing apply and preview flows after restoring a prior artifact.

## Non-Goals

- Full conversation history
- Diffing between historical generations
- Named versions
- Branching or merging generation histories
- Cloud sync

## Data Model

Add a small persisted history collection to the session snapshot.

Suggested shape:

- `generation_history: list[GenerationHistoryEntry]`

Each `GenerationHistoryEntry` should include:

- `id`
- `created_at`
- `goal`
- `summary`
- `artifact`

The list should be capped to a small number such as 5.

## Backend Design

### Session store

Extend `SessionStore.update_after_generate(...)` to:

- create a new `GenerationHistoryEntry`
- prepend it to `generation_history`
- trim the list to the configured maximum
- keep the newest generation as the active artifact, as it does today

### New endpoint

Add:

- `POST /api/session/restore-generation`

Request:

- `generation_id`

Behavior:

- find the matching history entry in the persisted session
- restore that entry's artifact into the active session state
- reset selection state to match the restored artifact
- clear stale apply results
- return the updated session snapshot

## Frontend Design

### History panel

Add a compact history section near the workspace controls or above the artifact panel.

Each item should show:

- relative ordering or timestamp
- the goal
- the artifact summary
- a `Restore` action

### Restore behavior

When the user restores a historical generation:

- the restored artifact becomes the active artifact in `App.tsx`
- file and change selections reset to the restored artifact defaults
- preview state resets
- existing diff/apply flows keep working normally

### Empty state

- If there is no generation history, render nothing.
- If only the active generation exists, the panel still provides useful visibility into the current iteration.

## Error Handling

- If a restore request references a missing history entry, backend returns `404`.
- If restore fails, frontend keeps the current artifact unchanged and shows a non-blocking error.

## Testing Strategy

### Backend

- generating adds a new history entry
- history is capped to the configured maximum
- restoring a generation updates the active artifact and selection defaults
- restoring a missing generation returns `404`

### Frontend

- restored session renders generation history entries
- clicking `Restore` switches the active artifact
- restoring clears stale apply result state
- restore failure keeps the current artifact visible

## Expected Outcome

After this slice, iterative use of TradePilot AI will feel much safer. Users can generate multiple options, revisit an earlier result, and continue from it without losing prior work the moment they try a new prompt.
