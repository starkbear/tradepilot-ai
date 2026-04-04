# Generation History Action Feedback Design

## Goal

Make history actions feel more responsive by showing a clear inline status message after successful history interactions.

## Recommended Approach

Keep the feature frontend-only and add a compact feedback message near the history panel inside `WorkspacePanel`.

The current history actions update state correctly, but users need to infer what just happened from the surrounding UI. This slice should add a small success-style note that confirms the outcome of the latest history action in plain language.

## Scope

### In Scope
- show a transient or latest-success feedback message for history actions
- cover these successful actions:
  - preview shown / hidden
  - review opened
  - generation restored / continued
  - generation removed
  - history cleared
- clear or replace the feedback when a new history action succeeds
- leave backend and action behavior unchanged

### Out of Scope
- backend or API changes
- toast system or animation framework
- error-message redesign
- persistence of feedback across reloads

## UX Design

Render a compact inline note near the history panel, for example above it or directly below its header.

Example messages:
- `Reviewing "Needs attention entry".`
- `Preview opened for "First history entry".`
- `Preview hidden for "First history entry".`
- `Continued from "Draft entry".`
- `Removed "Old entry" from history.`
- `Generation history cleared.`

The note should be lightweight and secondary to the history content, but clearly distinct from errors.

## Technical Design

Manage the feedback state in `App.tsx`, since that is already where history actions are coordinated.

Add a nullable `historyActionMessage` state that is:
- set on successful preview toggle / restore / delete / clear-history flows
- cleared when a history action fails
- reset when the session is cleared or when the app returns to login

Pass the value into `WorkspacePanel`, and render it above `GenerationHistoryPanel` when present.

## Error Handling

On failed history actions, do not show stale success feedback. Clear the feedback and continue surfacing the existing error message.

## Testing

Add frontend coverage for:
- showing feedback when preview is opened and hidden
- showing feedback after restore/continue succeeds
- showing feedback after delete succeeds
- showing feedback after clear history succeeds
- clearing stale feedback when a history action fails

## Acceptance Criteria

- Successful history actions show a clear inline confirmation message
- Failed history actions do not leave old success feedback visible
- The slice remains frontend-only
- Existing history action behavior is unchanged
