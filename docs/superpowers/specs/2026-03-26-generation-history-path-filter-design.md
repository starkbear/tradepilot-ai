# Generation History Path Filter Design

## Goal

Make expanded generation-history comparison path lists easier to scan by adding local filtering inside each expanded detail section.

## Recommended Approach

Keep the feature frontend-only and extend `GenerationHistoryEntryPreview`.

When a comparison detail section is expanded, show a small local filter input for that section. The input should narrow the displayed path list in-place using case-insensitive substring matching.

## Scope

### In Scope
- Add a per-section filter input for expanded comparison detail blocks
- Filter displayed paths in-place using case-insensitive matching
- Show an empty-state message when no paths match the filter
- Preserve existing count summary, `Copy Paths`, and `Show all / Show less` behavior

### Out of Scope
- Backend changes
- Persisting filter text across preview reopen
- Cross-section/global filtering
- Changing clipboard behavior

## UX Design

For an expanded comparison detail block with overflow:
- keep the existing `Show less` and `Copy Paths` actions
- show a text input below the action row with placeholder `Filter paths`
- filter results live as the user types
- when matches exist, render only matching paths
- when no matches exist, show `No matching paths.`

For collapsed sections:
- keep the input hidden
- preserve the existing compact view with `+N more`

## Technical Design

Extend `GenerationHistoryEntryPreview` with local per-section filter state keyed by comparison-detail key.

The detail rendering logic should:
- compute `filteredPaths` only when the section is expanded
- use the filter query to narrow the full path list before display
- clear the query when collapsing a section to avoid stale state

Clipboard copy should remain unchanged and continue to copy the full unfiltered category path list.

## Error Handling

No new backend behavior.

If the filter yields no matches:
- render a local empty state message
- keep `Copy Paths` and `Show less` available

## Testing

Add frontend coverage for:
- filter input appears only when a section is expanded
- typing filters the displayed list case-insensitively
- hidden paths become visible when they match the filter
- no-match filtering shows `No matching paths.`
- collapsing hides the filter input and restores the compact preview

## Acceptance Criteria

- Expanded overflowing sections expose a `Filter paths` input
- Filtering narrows the displayed path list in-place
- No-match states are handled cleanly
- Clipboard and expand/collapse behavior continue to work
- No backend or API changes are required
