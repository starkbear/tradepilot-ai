# Generation History Action Focus Design

## Goal

Help users land on the best next button faster by giving the recommended row action a stronger temporary visual focus when an entry is expanded.

## Recommended Approach

Keep the feature frontend-only and build on top of the new `Recommended` marker.

For expanded non-active rows, the recommended action should receive a stronger visual treatment than the other actions in the same row. This should feel like a focused cue rather than a permanent badge-heavy state.

## Scope

### In Scope
- add a stronger emphasis style for the recommended row action on expanded non-active entries
- keep the existing `Recommended` marker
- only show the stronger focus treatment when the entry is expanded and recommendation data exists
- keep row action behavior, ordering, and backend data unchanged

### Out of Scope
- backend or API changes
- auto-clicking or auto-restoring actions
- keyboard focus management or scrolling
- changing action labels or recommendation rules

## UX Design

For expanded non-active rows:
- the recommended action button should visually stand out more than other buttons in the row
- the effect should work for both `Review` and `Continue`
- collapsed rows and active rows should stay visually unchanged

The emphasis should be subtle but obvious, such as a stronger ring/glow and slightly different surface treatment, without making the button look like a separate control type.

## Technical Design

Reuse the existing `isRecommended` flag in `GenerationHistoryPanel.tsx`.

Add a second button class for recommended actions, for example:
- `generation-history-primary-action is-recommended`
- `secondary-button is-recommended`

Apply the class only when an action already has `isRecommended: true`.

Keep the implementation limited to:
- `GenerationHistoryPanel.tsx`
- `GenerationHistoryPanel.test.tsx` if needed for class assertions
- `styles.css`

## Error Handling

If no recommendation exists for a row, render buttons exactly as they behave today.

## Testing

Add frontend coverage for:
- expanded drifted rows rendering the recommended action with the emphasis class
- expanded additive or matching rows rendering the recommended action with the emphasis class
- collapsed rows and active rows not rendering any emphasized recommended action class

## Acceptance Criteria

- Expanded non-active rows show a clearly emphasized recommended action button
- Existing `Recommended` marker remains intact
- No row action behavior or ordering changes are introduced
- The slice remains frontend-only
