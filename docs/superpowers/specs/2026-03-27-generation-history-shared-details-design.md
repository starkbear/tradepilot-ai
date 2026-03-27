# Generation History Shared Details Design

## Goal

Let users inspect which file paths and change paths are shared between a historical generation and the current active generation.

## Recommended Approach

Keep the feature frontend-only and extend `GenerationHistoryEntryPreview`.

The existing comparison summary already shows `Shared Files` and `Shared Changes` counts. This slice should add lightweight `Show shared files` and `Show shared changes` toggles so users can inspect the actual shared paths on demand.

## Scope

### In Scope
- Add on-demand shared-files and shared-changes detail sections to history comparison previews
- Derive shared path arrays alongside the existing only-in-preview/current arrays
- Keep shared sections collapsed by default
- Reuse the current local comparison-detail interactions once a shared section is visible

### Out of Scope
- Backend changes
- Cross-generation diff visualizations
- Restore or apply flow changes
- Persisting shared-section visibility across preview reopen

## UX Design

Inside the existing `Compared to Current` block:
- keep the current summary counts
- when `Shared Files > 0`, show a `Show shared files` toggle
- when `Shared Changes > 0`, show a `Show shared changes` toggle
- toggles become `Hide shared files` / `Hide shared changes` when expanded

Expanded shared sections should:
- render as detail blocks under the summary
- list shared paths in deterministic alphabetical order
- use the same `Copy Paths`, `Show all / Show less`, and local filtering behavior as the existing difference sections

If there are no shared files or no shared changes, omit that toggle entirely.

## Technical Design

Extend `ComparisonSummary` with:
- `sharedFilesPaths`
- `sharedChangesPaths`

Add a second detail-section builder for shared categories and track visibility with local component state, keyed by section.

Visible shared sections should flow through the existing detail rendering path so they inherit:
- truncation
- expand/collapse
- local filter input when expanded
- copy-paths behavior

## Error Handling

No new backend behavior.

Shared detail visibility is local UI state only.

## Testing

Add frontend coverage for:
- rendering `Show shared files` / `Show shared changes` when shared counts are non-zero
- expanding a shared section reveals the expected shared path list
- hiding the shared section removes it again
- no shared toggles render when shared counts are zero
- existing difference-section interactions still pass

## Acceptance Criteria

- History comparison previews can reveal shared file/change paths on demand
- Shared sections stay hidden by default
- Shared sections reuse the existing detail interaction model once visible
- No backend or API changes are required
