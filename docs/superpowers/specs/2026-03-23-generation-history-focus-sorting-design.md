# Generation History Focus Sorting Design

## Goal

Make `Recent Generations` easier to scan by pulling the items that matter right now to the top of the panel without changing backend data or history actions.

## Recommended Approach

Split the history list into two frontend-only sections:

- `Focus Now`
- `Recent History`

The `Focus Now` section contains:

- the active generation
- any generation whose lifecycle status is `Needs Attention`

Everything else stays in `Recent History`.

Within each section, entries are sorted by a small derived priority and then by newest saved time first.

## Why This Slice

The history panel already supports preview, restore, remove, clear, active highlighting, apply summaries, and lifecycle badges. The next usability gap is visual prioritization: users still have to scan the full list to find the current item or the entries that need follow-up.

This slice improves focus without adding new controls, new persistence fields, or new backend behavior.

## Approach Options Considered

### 1. Simple Global Sort

Move `Active` and `Needs Attention` items to the top of a single flat list.

Pros:
- smallest implementation

Cons:
- still reads like one long list
- weaker visual cue about why some entries were promoted

### 2. Focus Section + Recent History

Render two sections with stable headings and derived ordering.

Pros:
- stronger scanability
- no new user decisions
- easy to test

Cons:
- slightly more UI structure

This is the recommended option.

### 3. Add Filters or Tabs

Introduce explicit controls such as `All`, `Needs Attention`, or `Current`.

Pros:
- more powerful browsing

Cons:
- adds interaction overhead
- increases state and test surface area

## Focus Classification Rules

Each entry belongs to one of two display groups.

### Focus Now

Include an entry when either of these is true:

- `entry.id === activeGenerationId`
- lifecycle status is `Needs Attention`

### Recent History

Include all remaining entries:

- `Draft`
- `Applied`
- non-active entries without issues

An entry should appear in exactly one group.

## Sorting Rules

Each entry gets a derived display priority:

1. active + needs attention
2. active
3. needs attention
4. draft
5. applied

Entries are sorted by:

1. derived display priority
2. `created_at` descending

This keeps the most urgent items at the top while still preserving recency within the same class.

## UI Structure

The history panel stays in the same place inside `WorkspacePanel`, but the list body changes from one flat list to grouped sections.

Recommended structure:

- panel header
- `Focus Now` section, only when it has entries
- `Recent History` section, always when any non-focus entries exist

If every entry qualifies for focus, render only `Focus Now`.
If no entry qualifies for focus, render only `Recent History`.

## Entry Behavior

This slice does not change entry actions.

These behaviors stay exactly the same:

- `Preview` / `Hide Preview`
- `Restore` / `Current`
- `Remove`
- `Clear History`
- active highlight styling
- lifecycle badges
- apply summary rendering

Only the visual ordering and section framing change.

## Copy and Presentation

Add lightweight section headings:

- `Focus Now`
- `Recent History`

Keep them plain and informational, not action-oriented.

While touching the history metadata lines, clean up the existing broken separator characters in:

- file/change count copy
- apply summary copy

Use a plain ASCII separator such as ` / ` so the copy stays stable across environments.

## Accessibility

Section headings should be real text in the DOM so screen readers can understand the grouping.

Sorting should not be the only signal:

- active highlight remains
- lifecycle badges remain
- focus grouping adds another readable layer

## Testing

### Frontend

Add tests covering:

- active entry appears in `Focus Now`
- non-active `Needs Attention` entry appears in `Focus Now`
- `Draft` and `Applied` entries fall under `Recent History`
- entries in the same section remain sorted by recency after priority ties
- restore, preview, and remove buttons still work from grouped entries

### Regression

Ensure:

- lifecycle badges still render correctly
- active entry still shows `Current`
- preview expansion still works after sorting

## Non-Goals

This slice does not add:

- backend sorting or status fields
- filters or tabs
- drag-and-drop reordering
- search
- pagination
- new history metadata beyond the current session snapshot
