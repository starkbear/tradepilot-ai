# Rewrite Diff Preview Design

Date: 2026-03-22

## Summary

Add a readable diff preview for `rewrite`-mode existing file changes by loading the current file contents from the selected workspace on demand, then comparing them with the generated replacement content in the frontend. If the current file cannot be loaded, the preview should gracefully fall back to the existing raw `new_content` preview.

## Goals

- Make `rewrite` changes as reviewable as `patch` changes.
- Compare generated replacement content against the current workspace file state.
- Keep the UI resilient when the current file cannot be read.
- Reuse the existing lightweight diff style instead of introducing a heavy code-review UI.

## Non-Goals

- No change to generation payloads or artifact schema.
- No diff editor, line numbers, or syntax highlighting.
- No apply-flow changes.
- No automatic rewrite conflict resolution.

## Recommended Approach

### Option 1: Keep rewrite preview as raw content

Pros:
- No backend work.

Cons:
- Does not meaningfully improve review quality.

### Option 2: Include current file content in generation artifact

Pros:
- Frontend gets everything in one response.

Cons:
- Makes generation responses larger.
- Current file contents can become stale between generation and apply.

### Option 3: Read current file on demand for rewrite preview

Pros:
- Smallest useful backend addition.
- Always previews against the latest workspace file contents.
- Keeps generation and preview concerns separate.

Cons:
- Adds one small read endpoint and one frontend fetch path.

Recommended.

## User Experience

When the user selects a `rewrite` change:

- The preview still shows path, reason, and mode.
- The frontend requests the current file content for that path from the selected workspace.
- If the read succeeds, the preview shows a lightweight unified diff between the current file and `new_content`.
- If the read fails, the preview falls back to the current behavior: summary plus full `new_content` block.

This keeps the product safe and understandable:
- Best case: users see exactly what a full-file replacement changes.
- Fallback case: users still see the generated replacement content.

## Backend Design

Add a small file-preview route under the existing files API area.

### Endpoint

Suggested shape:
- `POST /api/files/read`

Request fields:
- `workspace_path`
- `path`

Response fields:
- `path`
- `content`

### Validation rules

- Path must stay within the workspace using the same path safety rules already used in apply.
- Target must exist and be a file.
- Read text as UTF-8.
- If the file does not exist or cannot be read, return a clear API error.

The endpoint should stay intentionally small and not become a general-purpose file browser.

## Frontend Design

### API layer

Add a small helper in `frontend/src/lib/api.ts` to request current file content for a rewrite preview.

### State flow

In `App.tsx`:
- track preview content for the currently selected rewrite change
- trigger a fetch when a rewrite change becomes selected
- clear or replace preview state when selection changes
- keep the current artifact-selection behavior unchanged for files and patch changes

### Preview components

Add `RewriteDiffPreview`:
- accepts current file content and generated replacement content
- renders a lightweight unified diff using the same visual style as `PatchDiffPreview`

Update `ChangePreview`:
- `patch` -> keep `PatchDiffPreview`
- `rewrite` + loaded current content -> show `RewriteDiffPreview`
- `rewrite` + failed/unavailable current content -> fall back to full `new_content` preview

## Diff Rendering Strategy

Use the same lightweight unified diff approach already used for patch previews:
- unchanged lines prefixed with a space
- removed lines prefixed with `-`
- added lines prefixed with `+`

For implementation simplicity, `RewriteDiffPreview` can either:
- reuse extracted shared diff helpers, or
- share a small utility module with `PatchDiffPreview`

If shared logic starts to duplicate meaningfully, extracting a small `diff.ts` utility is appropriate.

## Error Handling

### Backend

Return clear messages for:
- file outside workspace
- file missing
- read failure

### Frontend

If reading current content fails:
- do not block the preview area
- show the existing rewrite fallback preview
- optionally show a short note that the current file could not be loaded

The fallback should be considered a graceful degradation, not a hard error state.

## Testing Strategy

### Backend tests

Add tests for:
- reading a valid file inside the workspace
- rejecting a path outside the workspace
- rejecting a missing file

### Frontend tests

Add tests for:
- selecting a rewrite change triggers a file-content request
- successful read shows diff-style rewrite preview
- failed read falls back to raw `new_content` preview
- existing patch preview behavior remains unchanged

### Regression coverage

Keep current `ArtifactPanel` and `App` tests green, extending them only where rewrite preview behavior changes.

## Risks and Mitigations

### Risk: Preview fetch introduces UI complexity

Mitigation:
- Only fetch for selected rewrite changes.
- Keep preview state local to the top-level app state.

### Risk: Rewrite preview and patch preview duplicate logic

Mitigation:
- Share a tiny diff helper if duplication becomes noticeable.
- Avoid building a generic diff framework prematurely.

### Risk: Current file changes after preview

Mitigation:
- Accept that preview is a best-effort snapshot of the latest file at preview time.
- Apply safety validation already protects against invalid later writes.

## Implementation Boundary

This spec covers:
- a small backend file-read endpoint
- frontend rewrite preview fetching
- diff-style rewrite preview rendering
- graceful fallback when current file cannot be loaded

This spec does not cover:
- file browsing
- syntax-aware diffing
- apply behavior changes
- richer code review UI

## Expected Outcome

After this change, `rewrite`-mode changes will be substantially easier to review. Users will see how the generated replacement differs from the current file instead of only seeing the raw replacement output, while the UI remains resilient when the current file cannot be loaded.
