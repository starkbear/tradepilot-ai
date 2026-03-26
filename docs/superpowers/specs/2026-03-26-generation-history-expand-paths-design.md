# Generation History Expand Paths Design

## Goal

Let users expand a comparison detail section in generation history previews so they can inspect the full path list in-place instead of being limited to the truncated preview.

## Recommended Approach

Keep the feature frontend-only and extend the existing comparison detail subsections in `GenerationHistoryEntryPreview`.

Each non-empty comparison detail block should keep the current capped preview by default, then add a lightweight `Show all` / `Show less` toggle when hidden paths exist.

## Scope

### In Scope
- Add per-category expand/collapse behavior for comparison detail blocks
- Reveal the full ordered path list in-place when expanded
- Preserve the existing count summary, `Copy Paths`, and `+N more` preview behavior when collapsed
- Keep state local to the preview component

### Out of Scope
- Backend changes
- Global expand/collapse controls
- Persisting expanded state across preview reopen
- Restore or apply flow changes

## UX Design

For any comparison detail block with hidden paths:
- keep showing the first 3 paths by default
- keep showing `+N more` in collapsed mode
- add a `Show all` button next to `Copy Paths`
- when expanded:
  - show the full path list
  - replace `Show all` with `Show less`
  - hide the `+N more` line because the full list is visible

For categories with 3 or fewer paths:
- do not show expand/collapse controls

Expanded state should be per-category and local to the currently open preview.

## Technical Design

Extend `GenerationHistoryEntryPreview` with local state for expanded comparison sections, keyed by the comparison-detail key.

The detail rendering logic should:
- compute `displayPaths` from `detail.paths`
- switch between capped and full arrays based on expanded state
- only render the expand/collapse button when `hiddenCount > 0`

No changes are needed to the comparison-summary derivation or clipboard API usage.

## Error Handling

No new backend behavior.

This is a purely local UI state enhancement.

## Testing

Add frontend coverage for:
- collapsed mode still showing only the first 3 paths and `+N more`
- clicking `Show all` reveals the hidden paths and swaps the button to `Show less`
- clicking `Show less` returns to the collapsed preview
- categories without overflow do not render expand/collapse controls
- active-entry and no-current-artifact fallback behavior still pass

## Acceptance Criteria

- Overflowing comparison detail sections expose `Show all`
- Expanded sections reveal the full path list in-place
- Collapsing returns to the truncated list with `+N more`
- Non-overflowing sections remain unchanged
- No backend or API changes are required
