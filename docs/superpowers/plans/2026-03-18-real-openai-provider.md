# Real OpenAI Provider Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder OpenAI provider with a real OpenAI-backed generation flow that returns validated `GenerationArtifact` data to the existing frontend.

**Architecture:** Keep the current backend boundaries intact. `OpenAIProvider` becomes responsible for HTTP requests, response parsing, and provider-level error mapping; `orchestrator.py` tightens JSON-only prompting; `artifacts.py` remains the final schema gate. Backend tests cover provider behavior directly, while existing API tests protect the frontend contract.

**Tech Stack:** FastAPI, Pydantic, pytest, httpx.

---

## File Structure Map

### Backend Runtime

- Modify: `backend/pyproject.toml`
  Adds `httpx` to runtime dependencies for direct OpenAI REST calls.
- Modify: `backend/app/core/config.py`
  Adds provider-level error types and any shared constants needed for request handling.
- Modify: `backend/app/providers/openai_provider.py`
  Replaces placeholder generation with real Chat Completions HTTP logic, JSON parsing, and provider error handling.
- Modify: `backend/app/services/orchestrator.py`
  Strengthens the prompt contract to require JSON-only output matching `GenerationArtifact`.
- Modify: `backend/app/main.py`
  Extends exception handling if provider request failures need a dedicated status code or stable envelope.

### Backend Tests

- Create: `backend/tests/test_openai_provider.py`
  Covers successful OpenAI responses, upstream HTTP failures, invalid JSON, and schema-invalid payloads.
- Modify: `backend/tests/test_chat_generate_api.py`
  Preserves current contract checks and adds an integration-style API failure assertion for OpenAI provider errors.

### Notes

- Do not change frontend API calls or types in this slice.
- Keep `backend/app/services/artifacts.py` unchanged unless validation behavior truly needs new messaging.

## Chunk 1: Provider Contract and Dependency Setup

### Task 1: Add dependency and provider unit tests first

**Files:**
- Modify: `backend/pyproject.toml`
- Create: `backend/tests/test_openai_provider.py`

- [ ] **Step 1: Write the failing provider success test**

```python
from app.providers.base import PromptBundle
from app.providers.openai_provider import OpenAIProvider


def test_generate_returns_dict_from_valid_openai_json(monkeypatch):
    provider = OpenAIProvider()
    prompt_bundle = PromptBundle(
        system_prompt='Return JSON only.',
        user_prompt='Build a trading assistant.',
        workspace_path='D:/Codex/Trading assistant',
        model='gpt-4.1',
    )

    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {
                'choices': [
                    {
                        'message': {
                            'content': '{"assistant_message":"ok","summary":"done","architecture":"split","project_tree":["frontend/"],"files":[],"warnings":[],"next_steps":[]}'
                        }
                    }
                ]
            }

    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setattr('app.providers.openai_provider.httpx.post', lambda *args, **kwargs: FakeResponse())

    result = provider.generate(prompt_bundle)

    assert result['summary'] == 'done'
    assert result['project_tree'] == ['frontend/']
```

- [ ] **Step 2: Write the failing provider error tests**

```python
def test_generate_raises_value_error_on_invalid_json(...):
    ...


def test_generate_raises_value_error_on_openai_http_failure(...):
    ...
```

- [ ] **Step 3: Run the provider test file to verify the new tests fail**

Run: `python -m pytest backend/tests/test_openai_provider.py -q`
Expected: FAIL because `OpenAIProvider` still returns placeholder data and does not use `httpx`.

- [ ] **Step 4: Add `httpx` to backend runtime dependencies**

```toml
[project]
dependencies = [
  "fastapi>=0.115,<1.0",
  "uvicorn>=0.34,<1.0",
  "pydantic>=2.10,<3.0",
  "httpx>=0.28,<1.0",
]
```

- [ ] **Step 5: Install the new dependency in the worktree**

Run: `python -m pip install httpx`
Expected: dependency available for local tests.

- [ ] **Step 6: Run the provider test file again to confirm it still fails for missing implementation, not missing imports**

Run: `python -m pytest backend/tests/test_openai_provider.py -q`
Expected: FAIL on placeholder behavior assertions.

- [ ] **Step 7: Commit the dependency and failing-test scaffolding only after implementation goes green**

Commit later with implementation in Task 2.

## Chunk 2: Real OpenAI Request Path

### Task 2: Implement Chat Completions request, JSON parsing, and provider-level errors

**Files:**
- Modify: `backend/app/providers/openai_provider.py`
- Modify: `backend/app/core/config.py`
- Modify: `backend/app/services/orchestrator.py`
- Create: `backend/tests/test_openai_provider.py`

- [ ] **Step 1: Add provider-specific error messaging in `config.py` only if needed**

```python
class ProviderResponseError(ValueError):
    pass
```

Use a new error type only if it improves status-code handling without complicating the API.

- [ ] **Step 2: Implement the minimal real OpenAI request in `openai_provider.py`**

```python
import json

import httpx

from app.core.config import ProviderConfigurationError, require_openai_key
from app.providers.base import PromptBundle


class OpenAIProvider:
    def generate(self, prompt_bundle: PromptBundle) -> dict:
        api_key = require_openai_key()
        response = httpx.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': prompt_bundle.model,
                'temperature': 0.2,
                'messages': [
                    {'role': 'system', 'content': prompt_bundle.system_prompt},
                    {'role': 'user', 'content': prompt_bundle.user_prompt},
                ],
            },
            timeout=30.0,
        )
        response.raise_for_status()
        payload = response.json()
        content = payload['choices'][0]['message']['content']
        return json.loads(content)
```

- [ ] **Step 3: Add explicit handling for upstream HTTP failures**

Map `httpx.HTTPStatusError` and `httpx.RequestError` to readable `ValueError`/provider errors such as:
- `OpenAI request failed with status 401`
- `OpenAI request failed before a response was received`

- [ ] **Step 4: Add explicit handling for invalid JSON or missing content**

Raise a readable error such as:
- `OpenAI returned invalid JSON for generation output`
- `OpenAI response did not include message content`

- [ ] **Step 5: Strengthen the system prompt in `orchestrator.py`**

```python
TRADING_SYSTEM_ASSISTANT_PROMPT = '''
You are a trading system assistant.
Return a single JSON object only.
Do not use markdown fences.
The object must contain: assistant_message, summary, architecture, project_tree, files, warnings, next_steps.
'''
```

- [ ] **Step 6: Run provider tests to verify they pass**

Run: `python -m pytest backend/tests/test_openai_provider.py -q`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/pyproject.toml backend/app/core/config.py backend/app/providers/openai_provider.py backend/app/services/orchestrator.py backend/tests/test_openai_provider.py
git commit -m "feat: add real openai provider backend"
```

## Chunk 3: API Contract Verification

### Task 3: Keep the existing `/api/chat/generate` contract stable

**Files:**
- Modify: `backend/tests/test_chat_generate_api.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Add a failing API test for provider request errors if a new error type is introduced**

```python
def test_generate_returns_400_when_openai_response_is_invalid(monkeypatch):
    class BrokenProvider:
        def generate(self, prompt_bundle):
            raise ValueError('OpenAI returned invalid JSON for generation output')

    monkeypatch.setattr('app.providers.factory.get_provider', lambda *_: BrokenProvider())
    client = TestClient(app)

    response = client.post('/api/chat/generate', json={...})

    assert response.status_code == 400
    assert 'invalid JSON' in response.json()['message']
```

- [ ] **Step 2: Run the chat API test file to verify the new assertion fails or is unimplemented**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: FAIL only if exception mapping needs adjustment.

- [ ] **Step 3: Adjust `main.py` exception handling only if required**

Keep the existing `503` for missing key and `400` for provider/value errors unless a specific case proves otherwise.

- [ ] **Step 4: Run the chat API test file again**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/tests/test_chat_generate_api.py backend/app/main.py
git commit -m "test: cover openai provider api failures"
```

## Chunk 4: Full Verification and Manual Smoke Test

### Task 4: Verify end-to-end behavior with the existing frontend

**Files:**
- No new product files expected
- Verify: `backend/tests/test_openai_provider.py`
- Verify: `backend/tests/test_chat_generate_api.py`
- Verify: `frontend/src/App.test.tsx`
- Verify: `frontend/src/components/ArtifactPanel.test.tsx`

- [ ] **Step 1: Run the backend test suite**

Run: `python -m pytest backend/tests -q`
Expected: PASS

- [ ] **Step 2: Run the frontend test suite**

Run: `Set-Location frontend; cmd /c npm run test -- --run`
Expected: PASS

- [ ] **Step 3: Run the full project test script**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend passing and frontend passing.

- [ ] **Step 4: Manually verify the local generation flow with a valid `OPENAI_API_KEY`**

Use the existing local frontend and backend:
- start backend
- start frontend
- submit a generation request from the UI
- confirm the result panel shows non-placeholder OpenAI output

- [ ] **Step 5: Commit any final cleanup only if needed**

```bash
git add ...
git commit -m "chore: finalize real openai provider verification"
```

## Execution Notes

- Follow strict TDD order for each backend behavior.
- Keep frontend code unchanged unless a backend behavior change proves a contract gap.
- Prefer small provider helper functions over one large `generate()` implementation if the file starts to sprawl.
- Do not silently fall back to placeholder results once real OpenAI calls are enabled.
- If a real OpenAI response repeatedly breaks schema, stop and revisit prompt design rather than adding ad hoc repair logic in this slice.
