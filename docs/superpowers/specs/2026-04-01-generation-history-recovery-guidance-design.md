# Generation History Recovery Guidance Design

## Goal

Help users decide what to do next after opening a historical generation preview by turning the comparison summary into a concise recommendation.

## Recommended Approach

Keep the feature frontend-only and extend `GenerationHistoryEntryPreview` with a `Suggested Next Step` block for non-active history entries.

The comparison view already exposes enough information to guide the user: matching paths, drifted paths, and paths that exist only in one side. This slice should translate those counts into short, actionable guidance without changing the existing `Continue`, `Review`, or `Restore` buttons in the list row.

## Scope

### In Scope
- derive a small recommendation object from the existing comparison summary
- render a `Suggested Next Step` block in non-active generation previews
- tailor the copy for the most common cases: drifted content, additive-only differences, and identical artifacts
- keep the rest of the history preview interactions unchanged

### Out of Scope
- backend or API changes
- changing primary or secondary history actions
- auto-restoring or auto-expanding any preview state
- session persistence for dismissed guidance

## UX Design

Inside the existing `Compared to Current` block, add a new guidance sub-block after the comparison counts.

The guidance block should contain:
- a short recommendation label such as `Review before restoring`, `Restore when ready`, or `Stay with current`
- one concise explanation sentence grounded in the comparison counts

Recommended rules:
- if there are any drifted files or drifted changes, recommend `Review before restoring`
- if there are no drifted paths but there are preview-only paths, recommend `Restore when ready`
- if everything is identical to the current artifact, recommend `Stay with current`
- if the current artifact has extra paths that the historical entry lacks, still bias toward `Review before restoring`

The block should read like guidance, not like a warning banner.

## Technical Design

Add a small helper that derives a guidance object from `ComparisonSummary`.

Suggested shape:
- `title`
- `body`
- `tone` or lightweight class selector

The helper should stay local to `GenerationHistoryEntryPreview.tsx` unless it grows beyond this component.

The comparison renderer should:
- keep building the existing summary
- derive guidance from that summary
- render the guidance block only for non-active entries with a current artifact

## Error Handling

No backend behavior changes.

If comparison data is missing, keep today¡¯s behavior and omit the guidance block.

## Testing

Add frontend coverage for:
- drifted paths producing a `Review before restoring` recommendation
- additive preview-only differences producing a `Restore when ready` recommendation
- identical artifacts producing a `Stay with current` recommendation
- active previews continuing to suppress the comparison and guidance block

## Acceptance Criteria

- Non-active history previews show a clear suggested next step
- Guidance changes based on the comparison state
- Existing history actions and preview interactions continue to work unchanged
- The slice remains frontend-only
