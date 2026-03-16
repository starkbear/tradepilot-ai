# Artifact Display Flow Design

**Date:** 2026-03-16
**Status:** Approved in conversation, pending file review

## Goal

Upgrade the current local web UI from a basic generation form into a real result-viewing workflow. After a successful generation request, the user should be able to inspect the returned artifact in a dedicated results panel instead of only seeing a short summary line.

## Scope

This design only covers the artifact display flow.

Included:

- rendering the full generation result in the frontend
- separating input concerns from result-display concerns
- previewing generated files in the UI
- preserving current loading and error behavior

Not included:

- writing files from the frontend
- backend schema changes beyond what already exists
- markdown rendering
- persistent session/history improvements

## Current Problem

The app can already:

- collect a workspace path and project goal
- call the backend generation API
- show loading state
- show generation errors

But it does not yet provide a useful post-generation experience. The returned artifact is reduced to a single summary string in the workspace form, which makes it hard to inspect architecture output, generated files, warnings, or next steps.

## Recommended Approach

Use a two-area page structure:

- `WorkspacePanel` remains the input/action area
- `ArtifactPanel` becomes the dedicated result-display area

This keeps the current workflow simple while creating a clean seam for the next feature, where users will select files and apply them to the workspace.

## UI Structure

After a successful generation request, the page should present:

### 1. WorkspacePanel

Responsibilities:

- workspace path input
- project goal input
- generate action
- loading state
- error message rendering

Non-responsibilities:

- artifact field rendering
- file preview rendering

### 2. ArtifactPanel

Responsibilities:

- render the returned generation artifact
- show major result sections in a readable order
- show the available generated files
- coordinate the currently previewed file

The first version should render these sections:

- `summary`
- `architecture`
- `project_tree`
- `files`
- `warnings`
- `next_steps`

### 3. FilePreview

Responsibilities:

- display the content of the currently selected generated file
- remain presentation-focused

## Interaction Design

### Successful generation

When generation succeeds:

1. `App` stores the returned artifact
2. `ArtifactPanel` is rendered
3. if `artifact.files.length > 0`, the first file becomes the default preview target
4. clicking a file in the file list updates the previewed file

### Generation failure

When generation fails:

- `WorkspacePanel` continues to show the error message
- `ArtifactPanel` should not replace the current state with a broken or partial view

### Empty sections

To avoid noisy UI:

- hide the warnings section if there are no warnings
- hide the next steps section if there are no next steps
- show a simple empty-state message if there are no generated files

## Component Boundaries

### `App`

Owns:

- `artifact`
- `errorMessage`
- `isGenerating`
- `selectedFilePath` or equivalent selected preview state

Coordinates:

- API calls
- default preview selection after successful generation
- passing state and callbacks into child components

### `WorkspacePanel`

Owns no long-lived app state.

Receives:

- form values
- loading state
- error message
- callbacks for field changes and generation

### `ArtifactPanel`

Receives:

- the full artifact
- currently selected file path
- callback for preview selection

Renders sections in a fixed, readable order and delegates preview rendering to `FilePreview`.

### `FilePreview`

Receives:

- the currently selected file draft

Renders:

- file purpose
- file content

## Data Flow

1. user enters workspace path and goal in `WorkspacePanel`
2. user triggers generation
3. `App` calls `generateArtifact(...)`
4. success response is stored as `artifact`
5. `App` derives or sets the default preview selection
6. `ArtifactPanel` renders the structured result
7. file selection updates `FilePreview`

## Rendering Rules

To keep this iteration small and stable:

- render `architecture` as plain text
- render `project_tree` as a simple list
- render file list as a clickable/selectable list
- do not add markdown parsing
- do not add code editors
- do not add file-apply controls yet

## Testing Strategy

### New tests

Add or update frontend tests to verify:

- successful generation shows the artifact panel
- `summary`, `architecture`, file list, and `next_steps` are visible when returned
- clicking different files changes the preview content

### Regression coverage

Preserve current tests for:

- local login flow
- workspace form visibility
- readable generation error display

## Risks and Guardrails

### Risk: input and result logic become tangled

Guardrail:

- keep `WorkspacePanel` focused on input/actions only

### Risk: preview state becomes fragile

Guardrail:

- store preview selection explicitly in `App`
- set default preview only on successful artifact refresh

### Risk: overbuilding the display layer

Guardrail:

- no markdown, no diff tools, no write actions in this step

## Success Criteria

This step is successful when:

- the user can submit a generation request
- the returned artifact renders in a dedicated panel
- the user can inspect multiple generated files through preview switching
- current error handling remains intact

## Next Step

After this display flow is implemented, the next natural slice is the file-apply flow:

- select generated files
- call `/api/files/apply`
- show apply results in the UI
