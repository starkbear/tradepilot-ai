# Generation History Filter Controls Design

## Goal

Make the generation history panel easier to browse when many entries accumulate by adding lightweight, frontend-only filter controls on top of the existing `Focus Now` and `Recent History` grouping.

## Recommended Approach

Add a compact filter row under the `Recent Generations` header with these options:

- `All`
- `Focus`
- `Needs Attention`
- `Draft`
- `Applied`

`All` remains the default and preserves the current grouped presentation:

- `Focus Now`
- `Recent History`

The other filters switch the panel into a filtered single-list view that shows only matching entries while keeping existing entry actions and previews intact.

## Why This Slice

The panel now supports:

- active highlighting
- lifecycle badges
- focus grouping
- preview / restore / remove
- history management

The next usability gap is targeted browsing. Once history grows beyond a few entries, users may want to quickly answer questions like:

- which generations still need attention?
- which ones are still drafts?
- which ones were already applied?

This slice solves that without adding backend state, search, or complex controls.

## Approaches Considered

### 1. Single Toggle

Add one toggle such as `Show focus only`.

Pros:
- minimal UI

Cons:
- only solves one browsing case
- cannot isolate drafts or applied entries

### 2. Lightweight Filter Chips

Add a small row of selectable filters above the history list.

Pros:
- fast browsing
- low implementation cost
- no backend changes
- easy to test

Cons:
- introduces one small piece of local UI state

This is the recommended option.

### 3. Search + Filters

Add text search and status filters together.

Pros:
- most powerful

Cons:
- significantly larger slice
- adds more state and interaction cost than needed right now

## Filter Definitions

### All

Default view.

Behavior:
- preserves the current grouped rendering
- shows `Focus Now` and `Recent History` sections as they work today

### Focus

Show entries that should draw immediate attention.

Include an entry when:
- `entry.id === activeGenerationId`
- or lifecycle status is `Needs Attention`

This matches the current focus grouping logic.

### Needs Attention

Show entries whose lifecycle badge resolves to `Needs Attention`.

### Draft

Show entries whose lifecycle badge resolves to `Draft`.

### Applied

Show entries whose lifecycle badge resolves to `Applied`.

## Rendering Rules

### All View

Keep the current grouped view:
- `Focus Now`
- `Recent History`

### Filtered Views

For any filter other than `All`:
- render one filtered section only
- use the filter label as the section heading
- keep sorting by the existing frontend display priority and `created_at` descending where relevant

For `Draft`, `Applied`, and `Needs Attention`, sorting can simply stay:
1. `created_at` descending

For `Focus`, keep the same priority order as the current focus grouping:
1. active + needs attention
2. active
3. needs attention
4. recency tie-breaker

## Empty States

If a non-`All` filter matches no entries, keep the panel visible and show a small empty-state message inside the filtered section.

Recommended copy pattern:
- `No draft generations yet.`
- `No applied generations yet.`
- `No generations need attention right now.`

This should not hide the filter row.

## State Model

Add one new frontend-local state value in the app layer:
- `generationHistoryFilter`

Suggested union type:
- `'all' | 'focus' | 'attention' | 'draft' | 'applied'`

Behavior rules:
- default to `all`
- preserve the selected filter while previewing, restoring, or removing entries
- when clearing history, the filter may stay selected; if the list disappears, the state can remain harmlessly set
- when a filter becomes empty after a restore/remove action, show the empty-state message rather than resetting automatically

## Component Responsibilities

### App

Own the filter state and pass it into `GenerationHistoryPanel`.

### GenerationHistoryPanel

- render the filter row
- derive filtered/grouped entries
- render either grouped view (`All`) or filtered single-section view (other filters)
- keep all current entry actions unchanged

No backend changes are needed.

## Styling

Add a small row of pill-style controls that visually match the existing workspace shortcuts and secondary buttons.

Visual guidance:
- default chip: subtle neutral
- selected chip: stronger filled or tinted state
- keep the row compact and wrap-friendly
- do not let the filter row overpower the entry badges

## Accessibility

- filter chips should be real buttons
- indicate selection with `aria-pressed`
- filtered section headings and empty-state copy should remain plain text in the DOM
- keyboard interaction should work with the existing button behavior

## Testing

### Frontend

Add tests covering:
- `All` remains the default view
- switching to `Needs Attention` shows only attention entries
- switching to `Draft` shows only draft entries
- switching to `Applied` shows only applied entries
- switching to `Focus` shows active and attention entries
- empty filtered result shows the correct empty-state copy
- preview / restore / remove still work from filtered views

### Regression

Ensure:
- existing grouped `All` view still renders correctly
- active badge and lifecycle badges still render correctly
- history previews still toggle correctly

## Non-Goals

This slice does not add:
- backend filtering
- persisted filter state in session storage
- free-text search
- combined multi-select filters
- badge or status rule changes
- new history metadata
