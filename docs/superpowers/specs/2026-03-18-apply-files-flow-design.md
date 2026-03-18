# Apply Files Flow Design

**Goal**

Extend the current generated-artifact workflow so users can keep the default full selection, uncheck individual files, apply the remaining files into the chosen workspace, and see a clear result summary afterward.

## Interaction Model

After a successful generation:
- all generated files are selected by default
- the user may uncheck any file from the file list
- the user clicks a single `Apply Selected Files` action
- the frontend sends only the selected files to `/api/files/apply`
- the page shows a result summary with:
  - applied
  - skipped
  - errors

Existing files should be overwritten in this first version.

## Frontend Design

### App state

Add:
- `selectedFilePaths`
- `isApplying`
- `applyResult`
- `applyErrorMessage`

Behavior:
- when a new artifact is generated, reset apply state
- when a new artifact is generated, default all files to selected
- when apply succeeds, render the summary block
- when apply fails, render a readable error message

### Components

- `ArtifactPanel`
  - keeps current artifact rendering responsibilities
  - adds file selection controls
- `ApplyPanel`
  - shows selected count
  - shows apply button
  - shows loading state
  - shows result summary
- `App`
  - owns state and network calls

## Backend Design

Keep the existing `/api/files/apply` route and request shape.

The backend should continue using the current workspace file application flow. This slice should only confirm that sending a subset of files results in only that subset being written, and that overwriting existing files remains allowed.

## Testing

Add tests for:
- default all-files-selected state after generation
- deselecting a file before apply
- apply request contains only selected files
- apply result summary rendering
- regression coverage for existing artifact rendering

If backend overwrite behavior is not already covered, add a narrow test for overwriting an existing file during apply.

## Non-Goals

Do not add:
- diff view
- per-file apply buttons
- confirmation modal
- auto-refresh of filesystem state beyond the apply summary
