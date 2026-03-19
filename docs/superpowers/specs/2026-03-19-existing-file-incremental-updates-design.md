# Existing File Incremental Updates Design

## Goal

Extend generation so the assistant can propose controlled updates to existing files, not only brand-new files, while preserving the current preview-first safety model.

## Scope

This slice adds structured change drafts for existing files.

Included:
- generation artifact support for existing-file changes
- two change modes: `patch` and `rewrite`
- frontend preview for change drafts
- selection and confirmation before applying changes
- backend apply logic for both new files and existing-file changes

Not included:
- fuzzy patching
- interactive diff editors
- conflict auto-resolution
- three-way merge logic
- rollback transactions

## Recommended Approach

Add a new `changes[]` collection to the existing artifact format instead of overloading the current `files[]` list.

This keeps the mental model clear:
- `files[]` means new file drafts
- `changes[]` means updates to existing files

Each change draft should be explicit about how it applies so the backend can remain strict and predictable.

## Change Draft Shape

Add a new change draft model, tentatively `FileChangeDraft`, with fields:
- `path`
- `mode`
- `reason`
- `selected`
- `new_content`
- `old_snippet`
- `replace_all_matches`

### Mode semantics

`patch`
- applies to an existing file only
- uses `old_snippet` as an exact search target
- replaces a single match by default
- fails if no exact match is found

`rewrite`
- applies to an existing file only
- replaces the full file content with `new_content`
- requires preview and explicit confirmation before apply

## Artifact Contract Changes

The `GenerationArtifact` response should now include:
- `files`
- `changes`

This preserves the existing generation contract while adding a new, clearly separated mutation channel.

The assistant can now return:
- new files to create
- existing files to patch
- existing files to rewrite when patching is not a good fit

## Frontend Design

### Artifact panel

The result panel should gain a new section:
- `Existing File Changes`

This section should behave similarly to the current new-file area:
- default all changes to selected
- allow deselecting any change
- allow previewing each change draft

### Change previews

For `patch` changes, the preview should show:
- target path
- reason
- `old_snippet`
- `new_content`

For `rewrite` changes, the preview should show:
- target path
- reason
- the full replacement content

### Apply action

Keep a single apply action that covers both new files and existing-file changes.

The user flow stays:
1. generate artifacts
2. preview files and changes
3. adjust selections
4. confirm apply

## Backend Apply Rules

### Patch mode

Strict matching rules:
- target file must already exist
- `old_snippet` must match exactly
- replace one match by default
- if no match is found, return an error
- do not attempt fuzzy matching or inferred edits

### Rewrite mode

Rules:
- target file must already exist
- overwrite the full file content with `new_content`
- only apply after explicit preview and confirmation

### New files

Current `files[]` behavior remains as-is.

## Apply Request Shape

Extend the apply request to include:
- `workspace_path`
- `files[]`
- `changes[]`

The backend should process both categories in one request.

Recommended execution order:
1. apply `changes`
2. apply `files`

This makes patch failures surface before any additional file writes create confusing partial outcomes.

## Apply Result Reporting

Preferred result shape:
- `applied_files`
- `applied_changes`
- `skipped`
- `errors`

If this is too broad for the first slice, the existing summary can be preserved as long as error messages clearly identify whether a failure came from a file create, patch, or rewrite.

## Safety Boundaries

This slice should remain conservative.

Rules:
- no write occurs without preview and confirmation
- paths must remain inside the selected workspace
- `patch` mode must fail loudly when the source snippet no longer matches
- `rewrite` mode must be explicit and visible in the UI
- no hidden fallback from patch to rewrite

## Testing Strategy

### Backend service tests

Add tests for:
- patch success when `old_snippet` matches exactly
- patch failure when the snippet is missing
- rewrite success for full-file replacement
- workspace path safety still holds for change targets

### API tests

Add or extend tests to verify:
- generation can return `changes[]`
- apply accepts mixed `files + changes`
- response shape remains stable for the frontend

### Frontend tests

Add tests to verify:
- artifact display includes `changes`
- changes are selected by default
- deselected changes are not submitted
- previews render correctly for patch and rewrite modes
- apply summary still renders after mixed apply requests

## Expected Outcome

After this slice, the assistant should be able to propose changes such as:
- add a new provider registration inside an existing backend file
- update a React component in place
- rewrite a small config or entrypoint file when a patch is not practical

This moves TradePilot AI from “scaffold generator” toward “safe project editor” while keeping the current confirmation-first boundary intact.
