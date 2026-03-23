# Generation History Status Badges Design

## Goal

Make `Recent Generations` easier to scan by showing a small set of clear status badges on each history entry.

## Recommended Approach

Add lightweight derived status badges in the frontend based on fields that already exist in each history entry:

- `Active`
- `Draft`
- `Applied`
- `Needs Attention`

This keeps the implementation UI-only. We already have the data we need from:
- `active_generation_id`
- `apply_summary`

## Why This Slice

The history panel now has restore, preview, remove, active highlighting, and apply summaries. The next usability gap is scan speed: users still have to read metadata lines to understand which entry is current, which one was applied, and which one needs a closer look.

Badges solve that without expanding the data model or adding more actions.

## Status Rules

### Active

Show `Active` when:
- `activeGenerationId === entry.id`

This continues the current behavior.

### Draft

Show `Draft` when:
- `entry.apply_summary` is `null`

This means the generation exists, but there is no recorded apply result yet.

### Applied

Show `Applied` when:
- `entry.apply_summary` exists
- `issue_count === 0`
- `error_count === 0`
- `applied_count > 0`

This means the generation was applied cleanly and does not currently signal follow-up work.

### Needs Attention

Show `Needs Attention` when:
- `entry.apply_summary` exists
- `issue_count > 0` or `error_count > 0`

This should take visual priority over `Applied`.

## Badge Combination Rules

Entries can show more than one badge:

- Active + Draft
- Active + Applied
- Active + Needs Attention

But they should never show:

- Draft + Applied
- Draft + Needs Attention
- Applied + Needs Attention

The status derivation should enforce one lifecycle badge:
- `Draft` or `Applied` or `Needs Attention`

Then optionally add `Active`.

## UI Placement

Render badges in the existing title row next to the goal text.

Recommended order:
1. `Active`
2. lifecycle badge (`Draft` / `Applied` / `Needs Attention`)

This keeps the most important signal stable across entries.

## Visual Treatment

Use the existing badge styling as the base and add variants:

- `Active`: existing emphasized style
- `Draft`: neutral/subtle
- `Applied`: positive/success
- `Needs Attention`: warning/destructive leaning

Do not add icons in this slice. Text badges are enough.

## Accessibility

Badges should remain plain text content in the DOM so they are available to screen readers and testable by text queries.

No tooltip or hover-only meaning should be required.

## Testing

### Frontend

Add tests covering:

- entry without `apply_summary` shows `Draft`
- entry with clean `apply_summary` shows `Applied`
- entry with issues shows `Needs Attention`
- active entry shows `Active` plus the correct lifecycle badge

### Regression

Ensure:

- restore/current button behavior remains unchanged
- preview toggling still works
- existing apply summary copy still renders

## Non-Goals

This slice does not add:

- filtering or sorting history by status
- backend status fields
- badge tooltips
- status-based actions
- timeline or audit views
