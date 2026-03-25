# Generation History Diff Details Design

## Goal

Extend the existing generation-history comparison summary so users can see which file paths and change paths differ from the current active generation before restoring a history entry.

## Recommended Approach

Keep the feature frontend-only and build on top of the existing comparison-summary derivation in `GenerationHistoryEntryPreview`.

The preview should continue to show count-based summary first, then add a compact detail block listing representative paths for each non-empty difference category.

## Scope

### In Scope
- Show path lists for differing files and changes in expanded history previews
- Limit each detail list to a small number of entries for scanability
- Show overflow counts when there are more entries than the preview displays
- Preserve the active-entry and no-current-artifact fallback behavior

### Out of Scope
- Backend changes
- Full side-by-side diffs between generations
- Restore-flow changes
- Apply-flow changes

## UX Design

Inside the existing `Compared to Current` block:
- keep the current counts
- add path detail subsections only for non-empty categories

Recommended categories:
- `Files only in this generation`
- `Files only in current`
- `Changes only in this generation`
- `Changes only in current`

Shared items should remain count-only in this slice to avoid clutter.

Each category should:
- show up to 3 paths
- preserve path order deterministically (alphabetical is fine)
- append a final line like `+2 more` when hidden items remain

If a category has zero items, omit its detail subsection.

## Technical Design

Extend the current comparison helper so it returns both counts and path arrays:
- `onlyInPreviewFilesPaths`
- `onlyInCurrentFilesPaths`
- `onlyInPreviewChangesPaths`
- `onlyInCurrentChangesPaths`

The preview component should render small lists from these arrays using a shared helper to cap display length and compute overflow.

## Error Handling

No new network or backend behavior.

If there is no current active artifact:
- keep hiding the comparison block

If the previewed entry is active:
- keep showing the active-state message only

## Testing

Add frontend coverage for:
- rendering path details for non-active comparisons
- showing `+N more` overflow messaging when a category exceeds the cap
- preserving active-entry and no-current-artifact behavior

## Acceptance Criteria

- Expanded non-active history previews show both comparison counts and path detail lists
- Detail lists are capped and can show overflow text
- Active previews still show only the active-state message
- No backend or API contract changes are required
