# OpenAI Output Stability Hardening Design

**Goal**

Improve the stability of real OpenAI generation responses so common low-risk schema drift no longer breaks the first generation attempt, while still rejecting structurally dangerous payloads.

## Scope

This slice is backend-only.

It should tighten three layers:
- prompt contract
- provider response handling
- safe artifact normalization

The frontend contract stays unchanged.

## Stability Strategy

### Strict fields

These fields must remain strictly validated:
- `summary`
- `architecture`
- `files`
- file item fields such as `path`, `purpose`, `content`, `selected`

If these fields are missing or malformed, the request should still fail.

### Safe normalization fields

These fields may be lightly normalized when the semantic meaning is still obvious:
- `project_tree`
- `warnings`
- `next_steps`

Allowed conversions:
- string -> single-item list
- simple dict -> readable list entries for `project_tree`
- no deep nested repair

## Prompt Contract

The OpenAI system prompt should be more explicit about:
- returning one JSON object only
- never using markdown fences
- keeping `project_tree`, `warnings`, and `next_steps` as arrays
- keeping `files` as an array of objects
- including every required field even when empty

## Provider Handling

`OpenAIProvider` should keep the current request path, but the parsing path should be more defensive:
- fail if message content is absent or empty
- fail if JSON parsing fails
- rely on artifact normalization for only the explicitly safe list-like fields
- do not add retries in this slice

## Testing

Add backend tests for:
- provider success when low-risk list-like fields drift to strings
- provider success when `project_tree` drifts to a simple dict
- provider failure when `files` is malformed
- provider failure when required descriptive fields are missing

## Non-Goals

Do not add:
- frontend UI changes
- provider retries
- auto-repair of file content
- repo-aware prompt augmentation
- multi-attempt generation workflows
