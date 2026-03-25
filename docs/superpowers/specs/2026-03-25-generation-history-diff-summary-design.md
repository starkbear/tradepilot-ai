# Generation History Diff Summary Design

## Goal

Add a lightweight comparison summary to each generation history preview so users can understand how restoring a historical generation would differ from the currently active generation before clicking `Continue`.

## Recommended Approach

Use a frontend-only comparison layer that derives a `history diff summary` from two artifacts:
- the previewed history entry artifact
- the current active artifact

This keeps the slice small, avoids backend schema churn, and improves restore decision-making without changing the apply or restore flows.

## Scope

### In Scope
- Compare the previewed history entry against the current active generation artifact
- Show a compact summary inside `GenerationHistoryEntryPreview`
- Cover file drafts and change drafts separately
- Gracefully handle cases where there is no active artifact or the previewed entry is already active

### Out of Scope
- Full file-by-file diff rendering between two generations
- Backend changes or persistence changes
- Restore behavior changes
- Apply-flow changes

## UX Design

When a history entry preview is expanded, show a new `Compared to Current` section when both of these are true:
- there is a current active artifact
- the previewed entry is not the active entry

The section should report:
- `Files only in this generation`
- `Files only in current`
- `Shared files`
- `Changes only in this generation`
- `Changes only in current`
- `Shared changes`

The summary should be count-based in the first version. If one side has zero items, still show the count so the comparison stays easy to scan.

If the previewed entry is already active, show a short neutral message such as `This is the active generation.` instead of a comparison block.

If there is no active artifact loaded, omit the section entirely.

## Technical Design

### Data Derivation

Derive comparison data on the frontend from artifact paths only.

For files:
- compare `artifact.files[].path`

For changes:
- compare `artifact.changes[].path`

Use set-style comparisons to produce:
- `onlyInPreview`
- `onlyInCurrent`
- `shared`

### Component Boundaries

- `App.tsx`
  Pass the current active artifact identity needed for comparison into the history panel path.
- `GenerationHistoryPanel.tsx`
  Pass comparison context into each expanded `GenerationHistoryEntryPreview`.
- `GenerationHistoryEntryPreview.tsx`
  Render the new comparison section and compute or consume the derived summary.

### Recommendation

Keep the diff-summary derivation close to the preview component unless it starts to bloat. If the preview file gets crowded, extract a small helper such as `buildGenerationComparisonSummary()` into a frontend utility module.

## Error Handling

No new network errors are introduced.

Edge behavior:
- If the previewed item is active, show the active-state message
- If there is no current active artifact, render nothing for the comparison section
- If files or changes are empty on either side, render zero counts cleanly

## Testing

Add frontend coverage for:
- showing comparison counts for a non-active history entry
- showing the active-state message for the active history entry
- hiding the comparison block when no active artifact exists
- keeping existing preview behavior intact

## Acceptance Criteria

- Expanding a non-active history entry shows a `Compared to Current` summary
- The summary reports counts for files and changes on both sides plus shared counts
- Expanding the active history entry does not show a misleading comparison
- No backend files or API contracts change
