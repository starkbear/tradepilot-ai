import types

import httpx
import pytest

from app.providers.base import PromptBundle
from app.providers.openai_provider import OpenAIProvider
import app.providers.openai_provider as openai_provider_module


def build_prompt_bundle() -> PromptBundle:
    return PromptBundle(
        system_prompt='Return JSON only.',
        user_prompt='Build a trading assistant.',
        workspace_path='D:/Codex/Trading assistant',
        model='gpt-4.1',
    )


def test_generate_returns_dict_from_valid_openai_json(monkeypatch) -> None:
    provider = OpenAIProvider()

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
    monkeypatch.setattr(
        openai_provider_module,
        'httpx',
        types.SimpleNamespace(post=lambda *args, **kwargs: FakeResponse()),
        raising=False,
    )

    result = provider.generate(build_prompt_bundle())

    assert result['summary'] == 'done'
    assert result['project_tree'] == ['frontend/']


def test_generate_normalizes_low_risk_list_shape_drift(monkeypatch) -> None:
    provider = OpenAIProvider()

    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {
                'choices': [
                    {
                        'message': {
                            'content': '{"assistant_message":"ok","summary":"done","architecture":"split","project_tree":{"frontend/":"React app"},"files":[],"warnings":"Use sandbox data only.","next_steps":"Add auth."}'
                        }
                    }
                ]
            }

    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setattr(
        openai_provider_module,
        'httpx',
        types.SimpleNamespace(post=lambda *args, **kwargs: FakeResponse()),
        raising=False,
    )

    result = provider.generate(build_prompt_bundle())

    assert result['project_tree'] == ['frontend/: React app']
    assert result['warnings'] == ['Use sandbox data only.']
    assert result['next_steps'] == ['Add auth.']


def test_generate_raises_value_error_on_invalid_json(monkeypatch) -> None:
    provider = OpenAIProvider()

    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {
                'choices': [
                    {
                        'message': {
                            'content': 'not-json',
                        }
                    }
                ]
            }

    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setattr(
        openai_provider_module,
        'httpx',
        types.SimpleNamespace(post=lambda *args, **kwargs: FakeResponse()),
        raising=False,
    )

    with pytest.raises(ValueError, match='invalid JSON'):
        provider.generate(build_prompt_bundle())


def test_generate_raises_value_error_on_openai_http_failure(monkeypatch) -> None:
    provider = OpenAIProvider()
    request = httpx.Request('POST', 'https://api.openai.com/v1/chat/completions')
    response = httpx.Response(401, request=request)

    def raise_http_status(*args, **kwargs):
        raise httpx.HTTPStatusError('Unauthorized', request=request, response=response)

    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setattr(
        openai_provider_module,
        'httpx',
        types.SimpleNamespace(post=raise_http_status, HTTPStatusError=httpx.HTTPStatusError),
        raising=False,
    )

    with pytest.raises(ValueError, match='status 401'):
        provider.generate(build_prompt_bundle())


def test_generate_raises_value_error_on_schema_invalid_payload(monkeypatch) -> None:
    provider = OpenAIProvider()

    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {
                'choices': [
                    {
                        'message': {
                            'content': '{"assistant_message":"ok","summary":"done","project_tree":["frontend/"],"files":[],"warnings":[],"next_steps":[]}'
                        }
                    }
                ]
            }

    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setattr(
        openai_provider_module,
        'httpx',
        types.SimpleNamespace(post=lambda *args, **kwargs: FakeResponse()),
        raising=False,
    )

    with pytest.raises(ValueError):
        provider.generate(build_prompt_bundle())


def test_generate_raises_value_error_on_malformed_files_payload(monkeypatch) -> None:
    provider = OpenAIProvider()

    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {
                'choices': [
                    {
                        'message': {
                            'content': '{"assistant_message":"ok","summary":"done","architecture":"split","project_tree":["frontend/"],"files":["README.md"],"warnings":[],"next_steps":[]}'
                        }
                    }
                ]
            }

    monkeypatch.setenv('OPENAI_API_KEY', 'test-key')
    monkeypatch.setattr(
        openai_provider_module,
        'httpx',
        types.SimpleNamespace(post=lambda *args, **kwargs: FakeResponse()),
        raising=False,
    )

    with pytest.raises(ValueError):
        provider.generate(build_prompt_bundle())