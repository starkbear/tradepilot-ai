# Generation History Controls Design

**Goal**

Add lightweight controls for managing local generation history so users can remove noisy entries or clear the whole history without wiping the rest of the saved session.

**Recommended approach**

Implement two controls:
- delete a single generation history entry
- clear the entire generation history list

Keep this scoped to local session state. Do not change artifact generation, restore semantics, or add history search/filtering.

**Backend design**

Extend the session layer instead of creating a new storage system.

- `SessionStore` gains:
  - `delete_generation(generation_id: str)`
  - `clear_generation_history()`
- deleting one entry removes it from `generation_history`
- clearing history sets `generation_history` to `[]`
- if the active `artifact` came from a deleted history entry, keep the active artifact on screen; history management should not silently destroy the current workspace state
- deleting an unknown entry returns a `404`-style API response

Add two session routes:
- `DELETE /api/session/generations/{generation_id}`
- `DELETE /api/session/generations`

Both routes return the updated persisted session snapshot so the frontend can fully rehydrate from one response.

**Frontend design**

Keep history controls inside the existing `GenerationHistoryPanel`.

- each history card gets a small destructive action: `Remove`
- the panel header gets a `Clear History` button
- deleting one item updates the list in place
- clearing the list removes the panel entirely when no entries remain
- if an action fails, keep the current list visible and show the existing workspace error surface

This keeps the interaction model consistent with the rest of the app:
- preview state stays where it is
- session control actions stay in the left workspace column

**Data flow**

1. User opens the saved workspace and sees recent generations.
2. User clicks `Remove` on one entry or `Clear History`.
3. Frontend calls the new session API.
4. Backend mutates only `generation_history` and returns the updated snapshot.
5. Frontend reuses `applyRestoredSession(...)`-style hydration to refresh local state.

**Error handling**

- missing generation id: return `404` with a readable message
- malformed session file: keep existing session-store fallback behavior
- delete/clear failure on the frontend: show a readable error and leave current UI state intact

**Testing**

Backend:
- deleting a known entry removes it from history
- deleting an unknown entry returns `404`
- clearing history empties the list but preserves active artifact/session fields

Frontend:
- history entries render `Remove`
- removing one entry updates the panel
- clearing history hides the panel
- failure leaves the panel visible and surfaces the error

**Non-goals**

- pinning or renaming history entries
- cross-workspace grouping
- search, filters, or pagination
- deleting the active artifact from the current preview state
