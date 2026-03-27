# Generation History Content-Aware Comparison Design

## Goal

Make history comparisons distinguish between paths that are merely shared by name and paths whose generated content still matches the current active generation.

## Recommended Approach

Keep the feature frontend-only and extend the existing comparison model inside `GenerationHistoryEntryPreview`.

The current history preview already computes path overlap for files and changes. This slice should add lightweight content signatures so shared paths can be split into two more meaningful buckets:
- matching content
- drifted content

That keeps the current `Compared to Current` surface intact while making the shared-path story much more useful during review.

## Scope

### In Scope
- derive content-aware comparison buckets for shared files and shared changes
- show whether shared paths are still identical or have drifted
- keep the existing difference details and shared detail interactions
- stay fully frontend-only

### Out of Scope
- backend or API changes
- full file diff rendering inside history comparison
- apply or restore flow changes
- persistent comparison preferences across sessions

## UX Design

Inside the existing `Compared to Current` block:
- keep the current path-based difference counts
- replace the generic shared counts with content-aware counts:
  - `Matching Files`
  - `Drifted Files`
  - `Matching Changes`
  - `Drifted Changes`
- only show detail toggles for non-zero categories

Detail toggles should follow the same lightweight pattern already used in the panel:
- `Show matching files` / `Hide matching files`
- `Show drifted files` / `Hide drifted files`
- `Show matching changes` / `Hide matching changes`
- `Show drifted changes` / `Hide drifted changes`

Expanded sections should keep reusing the existing detail rendering path, including:
- alphabetical ordering
- `Copy Paths`
- `Show all / Show less`
- local `Filter paths`

## Technical Design

Add a small content-signature layer to the preview comparison helpers.

For files:
- compare `path + content`

For changes:
- compare `path + mode + new_content + old_snippet + replace_all_matches`

`ComparisonSummary` should replace the old shared buckets with:
- `matchingFiles`
- `driftedFiles`
- `matchingChanges`
- `driftedChanges`
- matching/drifted path arrays for each category

The comparison should still begin with path overlap, then split each shared path by whether the normalized signature matches between the preview artifact and the current artifact.

Difference-only buckets should remain path-based and continue to behave exactly as they do today.

## Error Handling

No backend behavior changes.

If a shared path exists in both artifacts but the signature cannot be constructed consistently, treat it as drifted rather than matching.

## Testing

Add frontend coverage for:
- matching file paths rendering in the comparison summary and detail view
- drifted file paths rendering in the comparison summary and detail view
- matching change paths rendering in the comparison summary and detail view
- drifted change paths rendering in the comparison summary and detail view
- no matching/drifted toggles rendering when the corresponding bucket is empty
- existing difference-section interactions continuing to work

## Acceptance Criteria

- History comparison previews distinguish between matching and drifted shared paths
- Matching and drifted categories can be inspected on demand
- Existing detail interactions still work for the new categories
- The slice remains frontend-only
