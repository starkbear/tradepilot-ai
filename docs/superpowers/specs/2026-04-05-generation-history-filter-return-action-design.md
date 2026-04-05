# Generation History Filter Return Action Design

**Problem**

The history panel now auto-switches to `Focus` when the current non-`All` filter would hide the expanded preview. That keeps the preview visible, but it also leaves the user without a quick way to return to the filter they were using.

**Goal**

When the panel auto-switches to `Focus`, keep a lightweight memory of the previous filter and expose a single helper action that returns the user to that filter.

**Approach**

- Keep the current auto-switch behavior.
- Store the previous non-`All` filter value only when the panel auto-switches itself.
- Render the helper note as a short status line with a `Back to <filter>` button.
- Clear the stored return target when:
  - the user manually changes filters
  - the user uses the helper button
  - there is no current auto-switch note
- Do not restore the old filter automatically; keep it as an explicit user action.

**Non-goals**

- Do not persist filter return targets in session state.
- Do not add multiple-step history breadcrumbs.
- Do not change any backend APIs.

**Files**

- Modify `frontend/src/components/GenerationHistoryPanel.tsx`
- Modify `frontend/src/components/GenerationHistoryPanel.test.tsx`

**Testing**

- Add a panel test proving the helper note includes `Back to Needs Attention` after an automatic fallback.
- Add a panel test proving clicking the helper button returns the panel to the previous filter and clears the helper note.
- Re-run focused panel tests, then the full project test script.
