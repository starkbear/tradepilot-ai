# Generation History Preview Sync Design

## Goal

Keep the history panel visually aligned with restore actions so the target generation stays expanded after a successful continue/restore flow.

## Recommended Approach

Keep this slice frontend-only and treat expanded preview state as part of the restore success flow in `App.tsx`.

Right now a successful restore updates the active generation and artifact correctly, but `applyRestoredSession()` clears `expandedGenerationId`, so the restored item immediately collapses. That makes the action feel abrupt and hides the exact preview the user just chose. This slice should preserve the restored target as the expanded history entry when it still exists in the returned session snapshot.

## Scope

### In Scope
- keep the restored history entry expanded after a successful restore/continue
- keep the active item and expanded preview in sync after restore success
- preserve existing preview toggle behavior for manual open/close
- collapse preview only when the restored target no longer exists in the returned history
- frontend tests for the synced restore behavior

### Out of Scope
- backend or API changes
- new history filters or sorting rules
- scrolling behavior or animation
- persistence changes outside the existing session snapshot flow

## UX Design

When the user clicks `Continue` on a history item:
- the app restores that generation as usual
- the corresponding history entry becomes active
- its preview stays open so the user can immediately review the restored context

If the restored snapshot does not include that generation entry anymore, the preview can remain collapsed.

This keeps the current workflow intact while making the action outcome much easier to read.

## Technical Design

`App.tsx` already owns both restore actions and `expandedGenerationId`, so the state sync should stay there.

Recommended change:
- extend `applyRestoredSession()` with an optional restore context
- when restore succeeds, pass the target generation id into that restore context
- if the returned session still contains that id, set `expandedGenerationId` to it instead of clearing previews
- preserve the existing default reset path for startup/session load/clear/delete/generate

No changes are needed in `GenerationHistoryPanel` beyond consuming the updated `expandedGenerationId` value it already receives.

## Error Handling

If restore fails:
- keep the current expanded preview unchanged
- keep the current artifact unchanged
- continue showing the existing error message and clear stale success feedback as already implemented

## Testing

Add frontend coverage for:
- keeping the restored generation preview expanded after a successful continue/restore
- preserving existing collapse behavior for non-restore session applications
- leaving the expanded preview unchanged when restore fails

## Acceptance Criteria

- Successful continue/restore keeps the restored history entry expanded when it still exists in the returned session
- Other session-application flows keep their existing collapse/reset behavior
- Restore failure does not collapse the current preview
- The slice remains frontend-only
