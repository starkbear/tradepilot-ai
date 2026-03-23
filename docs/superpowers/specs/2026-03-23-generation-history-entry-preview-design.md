# Generation History Entry Preview Design

**Date:** 2026-03-23

## Goal

Make recent generation history entries easier to evaluate before restoring them by adding lightweight metadata and an expandable preview, without changing the existing restore or delete workflows.

## Context

The current history panel now supports:

- restoring a prior generation
- deleting a single history entry
- clearing the whole history

But each entry is still fairly opaque. It only shows the goal and a one-line summary, so users have to guess whether a saved generation is the one they want. The next highest-value improvement is to make entries more informative while keeping the panel compact.

## Approaches Considered

### 1. Keep the list minimal and only add timestamps

Add the saved time to each entry, but keep the rest of the panel unchanged.

**Pros**
- smallest implementation
- no extra state or layout complexity

**Cons**
- still weak for distinguishing similar generations
- users still cannot tell how large or risky a generation was

### 2. Add metadata and expandable entry previews

Each history entry shows compact metadata up front, with an optional `Preview` toggle that expands lightweight details such as architecture, file/change counts, warnings, and next steps.

**Pros**
- much clearer without overwhelming the panel
- keeps the current restore flow intact
- scales well with existing session persistence

**Cons**
- adds some client state and panel layout work

### 3. Full side-by-side historical artifact browser

Selecting a history entry would open a full artifact panel view next to the current one.

**Pros**
- richest inspection experience

**Cons**
- much larger UI and state jump
- too big for the next incremental slice

## Recommendation

Use **Approach 2**.

This keeps the history panel lightweight but makes each entry meaningfully more informative. It also stays aligned with the current product shape: the main artifact panel remains the active workspace, while history gets a small ¡°look before restore¡± layer.

## Design

### History Entry Summary

Each recent generation entry should show:

- goal
- saved timestamp in a readable local format
- summary
- file count
- change count

This gives users an immediate sense of what was generated and how large the result was.

### Expandable Preview

Each entry gets a `Preview` toggle. When expanded, the entry shows a lightweight read-only snapshot with:

- architecture
- project tree item count
- warnings count and warning list when present
- next steps list when present

The preview stays intentionally shallow. It should not attempt to embed full file contents, patch diffs, or the full artifact panel inside the history list.

### Interaction Rules

- only one history entry preview is expanded at a time
- restoring an entry still behaves exactly as it does today
- deleting an entry removes it from the list even if it is currently expanded
- clearing history removes the whole panel as it does today
- restoring a generation should clear any expanded history preview state

### State Boundaries

No backend schema changes are required because the existing `GenerationHistoryEntry` already stores the full artifact. This feature is mainly a frontend presentation enhancement.

Frontend state should add a single piece of UI state:

- `expandedGenerationId: string | null`

This state belongs in `App.tsx` and should be passed down into `GenerationHistoryPanel`.

## Components

### `GenerationHistoryPanel`

Extend the panel to render:

- per-entry metadata row
- `Preview` / `Hide Preview` control
- conditional entry preview body

Keep restore and remove controls visible and unchanged in purpose.

### `GenerationHistoryEntryPreview`

Add a small focused component for the expandable preview body. It should accept a `GenerationHistoryEntry` and render only summary-level artifact information.

This keeps `GenerationHistoryPanel` from becoming too large.

## Error Handling

This feature does not add new backend calls, so there are no new API error paths.

The only state edge cases are:

- deleting the currently expanded entry should collapse preview state automatically
- clearing history should clear preview state automatically
- restoring a generation should clear preview state so the panel does not reopen stale entry details

## Testing

### Frontend tests

Add coverage for:

- metadata rendering for a history entry
- expanding a history entry preview
- only one preview being open at a time
- deleting an expanded entry removes it cleanly
- restoring a generation clears expanded preview state

### Regression tests

Ensure the existing history controls still work:

- restore still calls the same endpoint
- remove still updates the panel
- clear history still hides the panel

## Non-Goals

This slice does not include:

- full historical artifact browsing
- file content previews inside history entries
- historical diff views
- search, pinning, or filtering in history
- server-side changes to history persistence

## Expected Outcome

After this change, the history panel should feel more like a useful ¡°recent work¡± surface instead of a simple restore list. Users should be able to glance at saved generations, inspect just enough detail to recognize the right one, and then restore confidently.
