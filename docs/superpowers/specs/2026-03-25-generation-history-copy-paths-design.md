# Generation History Copy Paths Design

## Goal

Make generation-history comparison details more actionable by letting users copy the full path list for any difference category directly from the history preview.

## Recommended Approach

Keep the feature frontend-only and extend the existing comparison detail subsections in `GenerationHistoryEntryPreview`.

Each non-empty comparison detail block should gain a lightweight `Copy Paths` button that copies the full ordered path list for that category, not just the truncated preview.

## Scope

### In Scope
- Add a per-category `Copy Paths` action for comparison detail blocks
- Copy the full path list for the selected category to the clipboard
- Show lightweight success feedback after copying
- Preserve the existing count summary, path preview, and `+N more` overflow behavior

### Out of Scope
- Backend changes
- Exporting files
- Batch copy across all categories
- Changes to restore, apply, or history filtering flows

## UX Design

Inside each non-empty comparison detail subsection:
- keep the category label
- keep the capped path preview list
- add a `Copy Paths` button near the category label
- after success, show short feedback like `Copied 4 paths`

Recommended behavior:
- copy the full category path list joined by newlines
- preserve deterministic alphabetical ordering
- only one copied state needs to be visible at a time
- feedback can be temporary and local to the clicked section

If clipboard write fails:
- show `Copy failed`
- keep the rest of the preview usable

## Technical Design

Extend `GenerationHistoryEntryPreview` so each comparison detail item carries:
- `label`
- `paths`
- a stable key

The preview component should:
- call `navigator.clipboard.writeText(paths.join('\n'))`
- track the last copied category key and status in local component state
- render per-section button text and status feedback without touching parent state

## Error Handling

No new backend behavior.

If clipboard APIs are unavailable or reject:
- catch the error
- show local failure feedback for that section
- do not affect other sections

## Testing

Add frontend coverage for:
- clicking `Copy Paths` writes the full path list, including hidden overflow items
- success feedback appears after copying
- copy failure feedback appears when clipboard write rejects
- active-entry and no-current-artifact fallback behavior still pass

## Acceptance Criteria

- Each non-empty comparison detail section exposes `Copy Paths`
- Copying uses the full category path list, not just the truncated preview subset
- Success and failure feedback are visible locally in the preview
- No backend or API changes are required
