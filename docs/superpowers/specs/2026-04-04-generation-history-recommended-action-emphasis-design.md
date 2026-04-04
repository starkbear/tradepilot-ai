# Generation History Recommended Action Emphasis Design

## Goal

Make the best next action in each expanded history row easier to spot by visually marking the button that matches the existing recovery guidance.

## Recommended Approach

Keep the feature frontend-only and add a lightweight `Recommended` emphasis to the matching row action when a non-active history entry is expanded.

The current preview already explains the recommended action in text. This slice should carry that recommendation one step further by visually marking the corresponding visible button in the same history row, so users can move from reading the guidance to taking the action without scanning the whole action set.

## Scope

### In Scope
- derive the recommended action label for non-active history entries in the panel
- visually mark the matching row action with a compact `Recommended` badge or label
- only show the emphasis when that entry is expanded and guidance is visible
- keep action behavior, ordering, and backend data unchanged

### Out of Scope
- backend or API changes
- changing which action is primary
- changing button order or click behavior
- auto-triggering restore, review, or preview actions
- persisting any emphasis state

## UX Design

For expanded non-active entries:
- if the recommended action is `Review`, the existing `Review` button should show a compact `Recommended` marker
- if the recommended action is `Continue`, the existing `Continue` button should show the same marker
- active entries should not show any recommendation marker on actions
- collapsed entries should remain unchanged to keep the list compact

The marker should feel like a small supporting cue, not a second badge system that overwhelms the row.

## Technical Design

Introduce a small local helper in `GenerationHistoryPanel.tsx` that mirrors the existing comparison-driven recommendation rules already used in `GenerationHistoryEntryPreview`:
- drifted or current-only differences -> `Review`
- additive-only or matching -> `Continue`
- no current artifact or active entry -> no recommendation marker

Use that helper while building row actions so the matching button can render an inline `Recommended` marker.

The preview component and backend contracts stay unchanged.

## Error Handling

If comparison data is unavailable, do not show any action emphasis.

If no visible row action matches the derived recommendation, render the row as it works today.

## Testing

Add frontend coverage for:
- expanded `Needs Attention` entries showing a `Recommended` marker on `Review`
- expanded additive or matching entries showing a `Recommended` marker on `Continue`
- collapsed entries not showing recommendation markers
- active entries not showing recommendation markers

## Acceptance Criteria

- Expanded non-active history rows visually mark the button that matches the guidance recommendation
- The marker only appears when it can be directly tied to a visible expanded preview
- No action behavior or ordering changes are introduced
- The slice remains frontend-only
