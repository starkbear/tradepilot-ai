# Generation History Primary Actions Design

## Goal

Make each generation history entry easier to act on by emphasizing the most relevant next step for that entry's current state, without changing backend behavior or removing any existing actions.

## Recommended Approach

Add a context-aware primary action to each history entry while keeping the current secondary actions available.

Primary action mapping:

- active entry: `Preview` or `Hide Preview`
- `Needs Attention` entry: `Review`
- non-active `Draft` entry: `Continue`
- non-active `Applied` entry: `Continue`

Secondary actions remain available so users can still explicitly choose `Preview`, `Restore`, or `Remove` where appropriate.

## Why This Slice

The history panel now has:

- lifecycle badges
- focus grouping
- filters
- preview / restore / remove

The next usability gap is action clarity. Users can browse the right entries quickly now, but they still have to infer which button they should click next. A context-aware primary action shortens that decision.

## Approaches Considered

### 1. Global Quick Actions

Add top-level actions such as `Open Active` or `Review Attention` above the list.

Pros:
- very small UI change

Cons:
- weak when more than one relevant entry exists
- disconnect between action and target item

### 2. Per-Entry Primary Action

Promote the most useful action on each row and keep the rest as secondary.

Pros:
- local, obvious guidance
- works well with existing filters
- no backend or state model changes

Cons:
- requires careful wording to avoid confusion with current buttons

This is the recommended option.

### 3. Card-Level Click Targets

Make the entire card clickable for preview or restore.

Pros:
- fewer buttons

Cons:
- poorer discoverability
- higher risk of accidental actions
- harder accessibility story

## Action Mapping Rules

### Active Entry

Primary action:
- `Preview` when collapsed
- `Hide Preview` when expanded

Reason:
- restoring the current item is meaningless
- the most useful next step is to inspect its details

### Needs Attention Entry

Primary action:
- `Review`

Behavior:
- expands the preview for that item
- does not automatically restore it

Reason:
- `Needs Attention` should invite inspection first, not an immediate state change

### Draft Entry

Primary action:
- `Continue`

Behavior:
- uses the existing restore flow

Reason:
- a draft item is usually something the user wants to resume working on

### Applied Entry

Primary action:
- `Continue`

Behavior:
- uses the existing restore flow

Reason:
- applied history is still a valid starting point for continued iteration

## Secondary Action Rules

Keep secondary actions available with minimal change.

### Active Entry

Show:
- primary `Preview` / `Hide Preview`
- secondary `Remove`

Do not show restore for the current entry.

### Needs Attention Entry

Show:
- primary `Review`
- secondary `Restore`
- secondary `Remove`

This keeps explicit restore available after inspection.

### Draft / Applied Entries

Show:
- primary `Continue`
- secondary `Preview`
- secondary `Remove`

This preserves inspection without giving both `Continue` and `Restore` equal visual weight.

## Behavior Details

- `Review` should call the same preview toggle flow already used by `Preview`
- `Continue` should call the same restore flow already used by `Restore`
- if a `Needs Attention` entry is already expanded, `Review` can stay labeled `Review`; it does not need a second label change in this slice
- existing aria labels should remain descriptive and specific to the entry goal

## UI Presentation

The primary action should look visually stronger than the secondary actions, but still fit the current interface.

Recommended treatment:
- primary action uses the default filled button style
- secondary actions use the existing `secondary-button` style
- keep the action row compact and wrap-friendly

Do not add icons in this slice.

## Accessibility

- keep all actions as real buttons
- ensure action labels remain explicit in `aria-label`
- do not rely on color alone to indicate primary vs secondary role

## Testing

### Frontend

Add tests covering:
- active entry shows `Preview` / `Hide Preview` as the primary action and no restore button
- `Needs Attention` entry shows `Review`
- draft and applied entries show `Continue`
- `Review` expands the preview for the targeted entry
- `Continue` still triggers the restore request path

### Regression

Ensure:
- remove still works
- filter views still work with the new action labels
- preview toggling still behaves as before

## Non-Goals

This slice does not add:
- automatic restore from `Review`
- backend action metadata
- keyboard shortcuts
- bulk actions
- confirmation dialogs
- changes to lifecycle badge rules
