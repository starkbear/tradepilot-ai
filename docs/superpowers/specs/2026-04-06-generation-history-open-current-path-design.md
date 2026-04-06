# Generation History Open Current Path Design

## Summary

Add a lightweight "Open in Current" action to generation history comparison details so users can jump from a historical diff path directly into the current artifact preview. This keeps the current workflow inside one page: compare, inspect, and continue applying changes without manually hunting through the current file or change lists.

## Goals

- Let users move from a historical comparison path to the matching item in the current artifact preview with one click.
- Work for both files and existing-file changes.
- Keep existing history comparison controls intact (`Copy Paths`, `Show all`, `Filter paths`, `Review`, `Continue`, `Restore`).
- Avoid any backend or session schema changes.

## Non-Goals

- No bidirectional sync from the artifact panel back into history.
- No scrolling or DOM anchoring inside the history list itself beyond existing preview behavior.
- No support for opening paths that do not exist in the current artifact.
- No changes to apply behavior or generation history persistence.

## Approach Options

### 1. Copy-only workflow
Keep `Copy Paths` as the only path-level affordance.

Pros:
- No new state coupling.
- Fastest implementation.

Cons:
- Users still have to manually search the current artifact panel.
- Weakest continuity between history comparison and current review.

### 2. Path-level `Open in Current` actions
Render an action beside each visible path in comparison detail sections. Clicking it selects the matching current file or change in the artifact panel.

Pros:
- Strongest improvement for the smallest slice.
- Uses existing current-artifact selection state instead of inventing new UI.
- Keeps the history workflow focused on inspection rather than editing.

Cons:
- Requires threading one new callback through the workspace/history components.
- Needs a clear fallback when a path is not present in the current artifact.

### 3. Full two-way linked comparison
Add shared highlighting and synchronized selection between history preview and current artifact preview.

Pros:
- Richest review experience.

Cons:
- Too much state and UI complexity for this slice.
- Higher regression risk across history and artifact panels.

## Recommended Design

Implement option 2.

Each comparison detail row in `GenerationHistoryEntryPreview` will keep its existing path list, but every path that exists in the current artifact will also render an `Open in Current` button. Clicking it will notify the app layer, which will select the matching file or change in the current artifact preview.

The current artifact panel already has the right behavior once a file or change is selected, so this feature should reuse those existing selection handlers instead of adding new preview components.

## Data Flow

1. `App` owns the current artifact selection state.
2. `WorkspacePanel` and `GenerationHistoryPanel` receive a new callback such as `onOpenCurrentArtifactPath`.
3. `GenerationHistoryEntryPreview` determines whether each visible path matches a current file or current change.
4. Clicking `Open in Current` calls the callback with `{ path, kind }` where `kind` is `file` or `change`.
5. `App` routes that selection into existing handlers:
   - file -> `setSelectedFilePath(path)` and clear selected change
   - change -> `setSelectedChangePath(path)` and clear selected file
6. `App` also updates the workspace-level action message so users get explicit feedback like `Opened current file "frontend/App.tsx".`

## Matching Rules

- If a path exists in `currentArtifact.files`, treat it as a file target.
- Else if it exists in `currentArtifact.changes`, treat it as a change target.
- If a path appears in neither list, do not render `Open in Current` for that path.
- If a path appears in both lists, prefer the file match first to keep the rule deterministic.

## UI Behavior

### Generation history preview

- Keep path text rendering unchanged.
- For each visible path with a current-artifact match, render a small `Open in Current` button beside that path.
- Buttons only appear when `currentArtifact` exists and the path is present in the current artifact.
- Shared, drifted, preview-only, and current-only sections can all use the same rendering rule.

### Workspace feedback

- Reuse `historyActionMessage` for jump feedback.
- Example messages:
  - `Opened current file "frontend/App.tsx".`
  - `Opened current change "shared/drifted.ts".`
- If no current artifact exists, no button is shown, so no extra failure state is needed.

## Component Changes

### `GenerationHistoryEntryPreview`

- Add a new optional callback prop for opening current artifact paths.
- Add a helper that classifies a path as `file`, `change`, or unavailable.
- Render `Open in Current` per visible path when available.

### `GenerationHistoryPanel`

- Thread the callback through to the preview component.

### `WorkspacePanel`

- Accept and pass through the callback.

### `App`

- Implement the callback using existing selection state.
- Update `historyActionMessage` when a current item is opened from history.

## Error Handling

- No new backend errors are introduced.
- If the current artifact is null, path-level open actions are hidden.
- If history or current artifact changes during rerender and a path is no longer available, the button simply disappears on the next render.

## Testing Strategy

### `GenerationHistoryEntryPreview` tests

- Renders `Open in Current` for matching file paths.
- Renders `Open in Current` for matching change paths.
- Does not render the button for preview-only paths that do not exist in the current artifact.
- Invokes the callback with the correct `{ path, kind }` payload.

### `GenerationHistoryPanel` integration test

- Threads the callback through to an expanded preview entry.

### `App` test

- Clicking `Open in Current` from a history preview selects the correct current file or change in the artifact panel.
- Shows the expected workspace feedback message.

## Verification

- Frontend targeted tests for the preview and app flow.
- Full project verification with `powershell -ExecutionPolicy Bypass -File scripts/test.ps1` before commit.
