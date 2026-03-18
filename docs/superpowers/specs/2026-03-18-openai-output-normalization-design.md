# OpenAI Output Normalization Design

**Problem**

The real OpenAI provider is live, but the model can occasionally return JSON that is semantically useful while still violating the `GenerationArtifact` schema. In manual browser testing, `project_tree` was once returned in a non-list shape, which caused the backend to reject the whole response before the user could see a result.

**Goal**

Add a minimal backend normalization step that improves stability for common near-miss shapes without weakening the API contract or silently accepting arbitrary malformed payloads.

## Approach

Use a light normalization layer inside `backend/app/services/artifacts.py` before `GenerationArtifact.model_validate(...)`.

This layer should:
- keep strict validation as the final gate
- normalize only the fields that are most likely to drift in harmless ways
- avoid changing frontend contracts or provider interfaces

## Normalization Scope

The first slice should cover:
- `project_tree`
- `warnings`
- `next_steps`

Rules:
- if a field is already a list, keep it
- if a field is a string, wrap it in a single-item list
- if `project_tree` is a dict, convert it into a readable list of strings using `key/value` pairs
- if a field is missing or `None`, leave it to existing defaults or validation behavior

This slice should not try to repair arbitrary nested data or rewrite file payloads.

## Boundaries

Do not change:
- frontend API calls or rendering contracts
- provider selection logic
- upstream retry behavior
- `files` normalization beyond current schema enforcement

The backend should still fail fast for truly unusable responses.

## Testing

Add focused backend tests that prove:
- `project_tree` as a string becomes `list[str]`
- `project_tree` as a dict becomes `list[str]`
- `warnings` and `next_steps` as strings become lists
- invalid `files` payloads still fail validation

## Expected Outcome

The first generation request should succeed more often when OpenAI returns slightly off-shape JSON, while clearly invalid payloads continue to be rejected.
