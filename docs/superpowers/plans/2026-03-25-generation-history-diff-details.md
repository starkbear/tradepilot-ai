# Generation History Diff Details Plan

1. Add frontend tests around `GenerationHistoryEntryPreview` for path-level comparison details, including overflow handling and existing active/no-current behavior.
2. Extend the comparison helper to derive sorted path arrays alongside existing counts for files and changes.
3. Render capped detail subsections inside the existing `Compared to Current` block, with `+N more` overflow messaging for each non-empty category.
4. Run focused frontend tests, then the full project test script, and commit the feature work.
