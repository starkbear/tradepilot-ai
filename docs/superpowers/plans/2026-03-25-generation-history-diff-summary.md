# Generation History Diff Summary Plan

1. Add focused frontend tests for history preview comparison behavior
   - Cover non-active comparison counts
   - Cover active-entry message
   - Cover no-active-artifact fallback

2. Implement comparison summary derivation
   - Compare file paths and change paths between the previewed artifact and current active artifact
   - Keep the logic frontend-only

3. Render the new comparison section in history previews
   - Show count-based summary
   - Preserve existing preview content and actions

4. Verify the feature end to end
   - Run focused frontend tests
   - Run full `scripts/test.ps1`

5. Commit and push the feature branch
