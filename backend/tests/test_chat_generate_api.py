from fastapi.testclient import TestClient
from app.main import app


class CapturingProvider:
    def __init__(self) -> None:
        self.last_prompt_bundle = None

    def generate(self, prompt_bundle):
        self.last_prompt_bundle = prompt_bundle
        return {
            'assistant_message': 'Here is your scaffold.',
            'summary': 'MVP scaffold ready.',
            'architecture': 'Frontend + backend split.',
            'project_tree': ['frontend/', 'backend/'],
            'files': [
                {
                    'path': 'README.md',
                    'purpose': 'project overview',
                    'content': '# Demo',
                    'selected': True,
                }
            ],
            'warnings': [],
            'next_steps': ['Review generated files'],
        }


class BrokenProvider:
    def generate(self, prompt_bundle):
        raise ValueError('OpenAI returned invalid JSON for generation output')


def test_generate_returns_structured_artifacts(monkeypatch) -> None:
    provider = CapturingProvider()
    monkeypatch.setattr('app.providers.factory.get_provider', lambda *_: provider)
    monkeypatch.setattr(
        'app.api.routes.chat.build_workspace_context',
        lambda *_: {
            'workspace_summary': 'React frontend + FastAPI backend.',
            'directory_snapshot': ['backend/', 'frontend/'],
            'key_files': [],
            'generation_guidance': ['The repository already exists.'],
        },
        raising=False,
    )
    client = TestClient(app)

    response = client.post(
        '/api/chat/generate',
        json={
            'message': 'Build a stock trading system MVP',
            'workspace_path': 'D:/Codex/Trading assistant',
            'provider_id': 'openai',
            'model': 'gpt-4.1',
        },
    )

    assert response.status_code == 200
    data = response.json()['data']
    assert data['summary'] == 'MVP scaffold ready.'
    assert data['files'][0]['path'] == 'README.md'
    assert provider.last_prompt_bundle is not None
    assert 'Workspace Summary:' in provider.last_prompt_bundle.user_prompt
    assert 'React frontend + FastAPI backend.' in provider.last_prompt_bundle.user_prompt



def test_generate_rejects_unknown_provider() -> None:
    client = TestClient(app)

    response = client.post(
        '/api/chat/generate',
        json={
            'message': 'Build a stock trading system MVP',
            'workspace_path': 'D:/Codex/Trading assistant',
            'provider_id': 'unknown',
            'model': 'x',
        },
    )

    assert response.status_code == 400



def test_generate_returns_503_when_openai_key_missing(monkeypatch) -> None:
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    client = TestClient(app)

    response = client.post(
        '/api/chat/generate',
        json={
            'message': 'Build a stock trading system MVP',
            'workspace_path': 'D:/Codex/Trading assistant',
            'provider_id': 'openai',
            'model': 'gpt-4.1',
        },
    )

    assert response.status_code == 503
    assert 'OPENAI_API_KEY is required' in response.json()['message']



def test_generate_returns_400_when_openai_response_is_invalid(monkeypatch) -> None:
    monkeypatch.setattr('app.providers.factory.get_provider', lambda *_: BrokenProvider())
    monkeypatch.setattr(
        'app.api.routes.chat.build_workspace_context',
        lambda *_: {
            'workspace_summary': 'Existing workspace.',
            'directory_snapshot': [],
            'key_files': [],
            'generation_guidance': [],
        },
        raising=False,
    )
    client = TestClient(app)

    response = client.post(
        '/api/chat/generate',
        json={
            'message': 'Build a stock trading system MVP',
            'workspace_path': 'D:/Codex/Trading assistant',
            'provider_id': 'openai',
            'model': 'gpt-4.1',
        },
    )

    assert response.status_code == 400
    assert 'invalid JSON' in response.json()['message']
