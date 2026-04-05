# Generation History Filter Visibility Sync Design

**Problem**

The history panel now keeps a restored generation expanded, but a non-`All` filter can still hide that expanded item after a status change. The most noticeable case is restoring or reviewing an entry from `Needs Attention` and then losing it from the current filter even though it is still the user's active focus.

**Goal**

When an expanded generation entry would disappear from the currently selected non-`All` filter because props changed, automatically switch the panel to `Focus` so the expanded item stays visible.

**Approach**

- Keep the current local `filter` state inside `GenerationHistoryPanel`.
- Add a small visibility check for the currently expanded generation id against the active filtered section.
- If the filter is not `all`, an expanded generation exists, and that generation is no longer included in the current filter result, switch the panel to `focus`.
- Show a lightweight helper note explaining that the panel switched to `Focus` to keep the current preview visible.
- Clear that helper note when the user manually changes filters or when no automatic fallback is needed.

**Non-goals**

- Do not auto-switch filters just because the active generation is not visible.
- Do not persist filter choice in session state.
- Do not change restore/apply/history APIs.

**Files**

- Modify `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify `frontend/src/components/GenerationHistoryPanel.test.tsx`

**Testing**

- Add a component test proving the panel auto-switches from a restrictive filter to `Focus` when the expanded item falls out of view after rerender.
- Add a component test proving manual filter changes clear the helper note.
- Re-run focused component tests and then the full project test script.
