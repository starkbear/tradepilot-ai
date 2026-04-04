# Generation History Action Guidance Design

## Goal

Make the recovery guidance more actionable by explicitly pointing users to the best existing history action for the current comparison state.

## Recommended Approach

Keep the feature frontend-only and extend the existing `Suggested Next Step` block inside `GenerationHistoryEntryPreview`.

The current guidance already tells the user what they should do conceptually. This slice should add one more line that maps the recommendation to the exact action label already visible in the history row, such as `Review`, `Restore`, or `Continue`, so the user can move from interpretation to action more quickly.

## Scope

### In Scope
- derive a lightweight `recommendedActionLabel` alongside the existing guidance copy
- render that action label inside the `Suggested Next Step` block for non-active entries
- align the action label with the existing row actions for each comparison case
- keep the rest of the history preview and row action behavior unchanged

### Out of Scope
- backend or API changes
- changing button order, styling hierarchy, or click behavior
- automatic focusing, scrolling, or triggering row actions
- session persistence for any guidance state

## UX Design

Inside the existing `Suggested Next Step` block, add a small `Recommended Action` line below the explanation.

Examples:
- drifted or current-only differences -> `Recommended Action: Review`
- additive preview-only differences -> `Recommended Action: Continue`
- identical artifact -> `Recommended Action: Continue`

This line should reference the exact action wording already present in the history row so the user can immediately map guidance to the visible control.

The guidance block should remain compact and informative rather than becoming a second action bar.

## Technical Design

Extend the local recovery-guidance helper to return:
- `title`
- `body`
- `recommendedActionLabel`

The helper should stay local to `GenerationHistoryEntryPreview.tsx`.

Rendering changes should be limited to the existing guidance block and should not require props from `GenerationHistoryPanel`, because the recommended labels can be inferred from the current guidance rules.

## Error Handling

No backend behavior changes.

If comparison data is unavailable, omit the guidance block entirely, preserving the current fallback behavior.

## Testing

Add frontend coverage for:
- drifted previews showing `Recommended Action: Review`
- additive preview-only differences showing `Recommended Action: Continue`
- identical previews showing `Recommended Action: Continue`
- active previews still omitting the guidance block entirely

## Acceptance Criteria

- Non-active history previews show both a guidance message and a recommended existing action label
- The recommended action label matches the existing row action wording
- No row-action behavior changes are introduced
- The slice remains frontend-only
