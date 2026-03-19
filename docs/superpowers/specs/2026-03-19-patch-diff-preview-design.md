# Patch Diff Preview Design

Date: 2026-03-19

## Summary

Add a lightweight visual diff preview for `patch`-mode existing file changes in the frontend. The goal is to help users understand exactly what a generated patch will change before they choose to apply it, without changing any backend schemas or apply behavior.

## Goals

- Make `patch` changes easier to review than the current old/new text blocks.
- Preserve the current assistant-style explanation alongside the code change preview.
- Keep the implementation fully frontend-only for the first iteration.
- Avoid introducing a large diff viewer dependency or complex review UI.

## Non-Goals

- No backend API or schema changes.
- No visual diff support for `rewrite` changes in this iteration.
- No line numbers, code folding, syntax highlighting, or side-by-side diff layout.
- No changes to apply logic, selection logic, or artifact generation.

## User Experience

When the user selects an existing-file change with `mode: patch`:

- The preview area still shows file path, change reason, and mode.
- Below the summary, the UI shows a unified diff-style block.
- Removed lines are prefixed with `-`.
- Added lines are prefixed with `+`.
- Unchanged context lines are prefixed with a space.

When the user selects an existing-file change with `mode: rewrite`:

- The preview remains the current summary plus full `new_content` block.

This creates a mixed preview experience:
- `patch` focuses on readability and review.
- `rewrite` remains a raw full-content replacement preview.

## Recommended Approach

### Option 1: Minimal side-by-side text

Render `old_snippet` and `new_content` as separate blocks.

Pros:
- Very fast to build.

Cons:
- Only slightly better than the current experience.
- Still forces the user to mentally compute the change.

### Option 2: Lightweight unified diff preview

Add a small frontend diff component that computes a simple unified diff for `patch` changes and renders it in a single block.

Pros:
- Clear review experience.
- Small implementation surface.
- No backend or dependency changes.

Cons:
- Not as rich as a full code review UI.

Recommended.

### Option 3: Full review-style diff viewer

Add a GitHub-style diff UI with line numbers, richer styling, and multiple diff sections.

Pros:
- Most polished experience.

Cons:
- Too large for this slice.
- Higher styling and testing cost.

## Architecture

### Existing components

- `ArtifactPanel` remains responsible for selecting and displaying the currently active artifact item.
- `ChangePreview` remains the main preview wrapper for existing-file changes.

### New component

Add `PatchDiffPreview`:

Responsibilities:
- Accept `oldSnippet` and `newContent`.
- Compute a simple unified diff view.
- Render the result as a single preformatted diff block.

### Updated component behavior

`ChangePreview` becomes a small dispatcher:

- For `patch` changes:
  - Show path, reason, and mode.
  - Render `PatchDiffPreview`.
- For `rewrite` changes:
  - Show path, reason, and mode.
  - Render the existing full `new_content` block.

No changes are required in `ArtifactPanel` data flow beyond continuing to pass the selected change through.

## Diff Rendering Rules

The first iteration should favor stability over sophistication.

### Rendering model

Generate a lightweight unified diff with these line prefixes:

- ` ` for unchanged lines
- `-` for removed lines
- `+` for added lines

### Simplification strategy

Use a small diffing strategy suitable for short snippets:

- Split `old_snippet` and `new_content` into lines.
- Identify common prefix lines.
- Identify common suffix lines.
- Treat the remaining middle region as the changed block.
- If there is no shared context, render all old lines as removed and all new lines as added.

This is sufficient for short AI-generated patches and avoids bringing in a full diff engine.

### Empty states

- If `old_snippet` is missing for a `patch`, the preview falls back to rendering only added lines from `new_content`.
- If `new_content` is empty, the diff renders the removed lines only.

## Testing Strategy

Add frontend tests for the new preview behavior.

### PatchDiffPreview tests

Cover:
- A simple line insertion.
- A simple line deletion.
- A complete replacement with no shared context.

### ChangePreview tests

Cover:
- `patch` mode renders a diff block and no longer relies on separate old/new text sections.
- `rewrite` mode still renders the complete replacement content.

### Regression coverage

Keep the existing `ArtifactPanel` preview-switching tests green to ensure:
- Selecting patch changes still works.
- File selection and apply flow remain unaffected.

## Risks and Mitigations

### Risk: Diff logic grows too complex

Mitigation:
- Keep the algorithm intentionally small and only suitable for short snippets.
- Do not attempt multi-hunk or syntax-aware diffing in this slice.

### Risk: Patch preview looks inconsistent with rewrite preview

Mitigation:
- Accept the mixed presentation intentionally for this iteration.
- Treat rewrite diff visualization as a future follow-up feature.

### Risk: Users assume the diff is exact Git-style output

Mitigation:
- Present it as a lightweight preview for human review, not as a formal patch file.

## Implementation Plan Boundary

This spec only covers:
- New `PatchDiffPreview` component.
- `ChangePreview` integration.
- Frontend tests for patch diff behavior.

It does not include:
- Backend changes.
- Rewrite diff visualization.
- Rich diff viewer UI.
- Apply flow changes.

## Expected Outcome

After this change, selecting a `patch`-mode existing-file change should show a concise assistant summary followed by a readable unified diff preview, making it much easier to review generated modifications before applying them.
