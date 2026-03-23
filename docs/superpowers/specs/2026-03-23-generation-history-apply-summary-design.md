# Generation History Apply Summary Design

## Goal

Expose a lightweight apply-status summary on each generation history entry so the workspace panel shows which generation has already been applied, how much was applied, and whether any issues were raised.

## Recommended Approach

Add a small `apply_summary` object to `GenerationHistoryEntry` and update it only when `/api/files/apply` succeeds for the current active generation.

This keeps the history panel useful without turning session storage into a full audit log. We only persist counts and short status signals, not the full apply payload over and over.

## Alternatives Considered

### 1. Applied badge only

Show a single `Applied` badge per history entry.

This is easy to build, but it loses the most helpful context: whether the run was partially applied, whether issues were raised, and how much content actually landed.

### 2. Summary counts in history entries

Persist a compact summary with:
- validated count
- applied count
- applied files count
- applied changes count
- issue count
- error count

This is the recommended option. It gives the user immediate signal while keeping the session snapshot small and stable.

### 3. Full apply-history log

Persist every apply result as a separate timeline event.

This is richer, but it adds more state management, more UI surface, and more edge cases around repeated applies. It is too large for this slice.

## Data Model

Add a new `GenerationApplySummary` shape in backend and frontend types:

- `validated_count: number`
- `applied_count: number`
- `applied_files_count: number`
- `applied_changes_count: number`
- `issue_count: number`
- `error_count: number`
- `last_applied_at: string`

Extend `GenerationHistoryEntry` with:

- `apply_summary: GenerationApplySummary | null`

`apply_summary` is nullable so older history entries and brand-new generations remain valid without migration work.

## Backend Behavior

### Session updates

When a generation is created:
- new history entry starts with `apply_summary = null`

When apply succeeds:
- keep writing the existing top-level `apply_result`
- if `active_generation_id` is set, locate that history entry and write a fresh `apply_summary`
- leave non-active history entries untouched

When a generation is restored:
- do not copy another entry's `apply_summary`
- just mark that entry as active

When a generation is deleted or history is cleared:
- existing behavior stays the same

### Summary derivation

Derive summary counts directly from `ApplyResult`:
- `validated_count = len(validated)`
- `applied_count = len(applied)`
- `applied_files_count = len(applied_files)`
- `applied_changes_count = len(applied_changes)`
- `issue_count = len(issues)`
- `error_count = len(errors)`
- `last_applied_at = now(UTC)`

We intentionally do not persist full issue payloads inside history entries. The current active apply result already covers detailed issue display in the main artifact area.

## Frontend Behavior

### History list

Each entry in `Recent Generations` should show compact status text when `apply_summary` exists, for example:

- `Applied 3 items`
- `2 files • 1 changes`
- `1 issues`

This should appear in the history entry body near the existing `files / changes` metadata.

### Expanded preview

When a history preview is expanded and `apply_summary` exists, show an `Apply Summary` block with:
- validated count
- applied count
- applied files count
- applied changes count
- issues count
- errors count
- saved timestamp

If `apply_summary` is null, show nothing. We do not add placeholder copy for unapplied generations.

## Error Handling

This slice should not change the apply API contract.

Rules:
- only successful apply responses update history summaries
- failed apply requests keep existing history summaries untouched
- if no `active_generation_id` exists, top-level `apply_result` still updates, but no history entry gets patched

## Testing

### Backend

Add tests for `SessionStore.update_after_apply()`:
- updates the active history entry with summary counts
- leaves non-active entries unchanged
- does nothing to history entries when no active generation exists

Add API coverage confirming:
- `/api/files/apply` still returns the same response shape
- session snapshot returned later includes the updated `apply_summary`

### Frontend

Add tests verifying:
- a history entry renders apply summary copy when present
- expanded preview shows the apply summary block
- entries without `apply_summary` do not render that block
- restoring or removing history still works with the extended entry shape

## Non-Goals

This slice does not add:
- multiple apply attempts per generation
- full historical issue logs
- separate applied/unapplied filters
- timeline views
- diffing between apply attempts
