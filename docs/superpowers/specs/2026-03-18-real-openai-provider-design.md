# Real OpenAI Provider Design

Date: 2026-03-18

## Goal

Replace the current placeholder OpenAI provider response with a real OpenAI-backed generation flow while keeping the existing frontend contract and `GenerationArtifact` schema unchanged.

## Scope

This slice only upgrades backend generation behavior.

Included:
- Real OpenAI request from `OpenAIProvider`
- Existing `system_prompt + user_prompt` flow
- Structured JSON output parsed into `GenerationArtifact`
- Clear error handling for missing API key, OpenAI HTTP failures, invalid JSON, and schema validation failures
- Backend-focused tests for provider behavior

Excluded:
- Frontend contract changes
- Streaming responses
- Multi-turn memory
- Automatic retries or JSON repair passes
- File apply workflow changes
- Multi-provider UI work

## Recommended Approach

Use OpenAI Chat Completions via direct `httpx` calls.

Why this approach:
- Fits the existing `PromptBundle` structure cleanly
- Keeps the current backend architecture lightweight
- Avoids introducing the OpenAI SDK for a single provider integration
- Makes request/response handling, timeouts, and error mapping explicit

## Request Design

`OpenAIProvider.generate()` will:

1. Read `OPENAI_API_KEY`
2. Build a Chat Completions request with:
   - `model`
   - `messages`
   - low temperature for stable outputs
3. Instruct the model to return JSON matching the existing `GenerationArtifact` contract
4. Parse the returned message text as JSON
5. Return a Python `dict` for `normalize_generation()` to validate

### Prompt Strategy

The provider should preserve the current orchestrator flow:
- `system_prompt` defines the assistant role and requires JSON-only output
- `user_prompt` carries the project request
- `workspace_path` may be included as context text, but not treated as an imperative file operation target

Recommended system prompt rule:
- Return a single JSON object only
- Include the fields required by `GenerationArtifact`
- Do not wrap the JSON in markdown fences
- Do not include explanatory prose outside the JSON

## Response Handling

Expected model output shape:

```json
{
  "assistant_message": "...",
  "summary": "...",
  "architecture": "...",
  "project_tree": ["frontend/", "backend/"],
  "files": [
    {
      "path": "README.md",
      "purpose": "...",
      "content": "...",
      "selected": true
    }
  ],
  "warnings": ["..."],
  "next_steps": ["..."]
}
```

The backend remains responsible for final validation.

Validation path:
- Provider parses text into JSON
- `normalize_generation(raw)` validates against `GenerationArtifact`
- Validation errors are surfaced as backend errors instead of silently accepted

## Error Handling

The provider should surface stable, user-readable failures for these cases:

### Missing API key

Current behavior remains:
- Raise a configuration error when `OPENAI_API_KEY` is absent
- Frontend continues to show the setup guidance card

### OpenAI HTTP failure

Examples:
- 401 unauthorized
- 429 rate limited
- 5xx upstream failure

Behavior:
- Raise a backend error with a concise message that includes the upstream status
- Do not expose raw secrets or full request bodies

### Invalid JSON from model

Behavior:
- Raise an error indicating that OpenAI returned invalid structured output
- Do not pass malformed content to `normalize_generation()`

### Schema validation failure

Behavior:
- Raise an error indicating that the model response did not match the expected artifact schema
- Preserve enough detail for debugging without leaking sensitive request data

## Component Changes

### `backend/app/providers/openai_provider.py`

Responsibilities after this change:
- Validate API key presence
- Send Chat Completions request using `httpx`
- Parse returned message content into JSON
- Raise clear provider-level errors on request or parsing failures

### `backend/app/services/orchestrator.py`

Likely minor update only:
- Strengthen the system prompt to demand JSON-only output conforming to the artifact shape

### `backend/app/services/artifacts.py`

No structural change expected.

It remains the final schema gate.

## Testing Strategy

Primary emphasis is backend test coverage.

### Required tests

1. Successful OpenAI generation
- Mock OpenAI response with valid JSON
- Verify `OpenAIProvider.generate()` returns a dict accepted by `normalize_generation()`

2. Missing API key
- Verify the existing configuration error still triggers

3. Non-200 OpenAI response
- Mock 401, 429, or 500
- Verify provider raises a clean backend-facing error

4. Invalid JSON payload
- Mock a text response that is not valid JSON
- Verify provider raises a structured-output error

5. Schema-invalid JSON
- Mock valid JSON missing required artifact fields
- Verify validation fails clearly

## Implementation Notes

Suggested dependency:
- `httpx`

Suggested request defaults:
- conservative timeout
- low temperature
- JSON-only instruction in the system message

Suggested model behavior:
- keep the requested model configurable from `PromptBundle.model`
- do not silently substitute another model unless explicitly designed later

## Risks

- Model output may still occasionally drift from strict JSON, even with strong instructions
- Rate limits or auth failures will now surface as real upstream errors instead of placeholder results
- Real generation may take longer than the placeholder response and expose latency in the UI

## Success Criteria

This design is successful when:
- the frontend generation flow returns a real OpenAI-backed artifact instead of placeholder data
- missing-key behavior still shows the current setup guidance card
- malformed or invalid model responses fail cleanly
- backend and frontend tests continue to pass
