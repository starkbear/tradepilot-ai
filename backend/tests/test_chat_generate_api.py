from fastapi.testclient import TestClient

from app.main import app
from app.services.session_store import SessionStore


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
            'changes': [
                {
                    'path': 'backend/app/main.py',
                    'mode': 'patch',
                    'reason': 'Register the router.',
                    'old_snippet': 'app = FastAPI()\n',
                    'new_content': 'app = FastAPI()\napp.include_router(router)\n',
                    'selected': True,
                }
            ],
            'warnings': [],
            'next_steps': ['Review generated files'],
        }


class BrokenProvider:
    def generate(self, prompt_bundle):
        raise ValueError('OpenAI returned invalid JSON for generation output')


def install_temp_session_store(monkeypatch, tmp_path) -> SessionStore:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    monkeypatch.setattr('app.api.routes.auth.session_store', store)
    monkeypatch.setattr('app.api.routes.chat.session_store', store)
    monkeypatch.setattr('app.api.routes.files.session_store', store)
    monkeypatch.setattr('app.api.routes.session.session_store', store)
    return store


def test_generate_returns_structured_artifacts(monkeypatch, tmp_path) -> None:
    provider = CapturingProvider()
    store = install_temp_session_store(monkeypatch, tmp_path)
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
    assert data['changes'][0]['path'] == 'backend/app/main.py'
    snapshot = store.get_session()
    assert snapshot.screen == 'workspace'
    assert snapshot.workspace_path == 'D:/Codex/Trading assistant'
    assert snapshot.goal == 'Build a stock trading system MVP'
    assert snapshot.artifact is not None
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
