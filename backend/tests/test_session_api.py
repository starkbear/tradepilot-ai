from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.services.session_store import SessionStore


def install_temp_session_store(monkeypatch, tmp_path: Path) -> SessionStore:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    monkeypatch.setattr('app.api.routes.auth.session_store', store)
    monkeypatch.setattr('app.api.routes.chat.session_store', store)
    monkeypatch.setattr('app.api.routes.files.session_store', store)
    monkeypatch.setattr('app.api.routes.session.session_store', store)
    return store


def test_get_session_returns_default_snapshot(monkeypatch, tmp_path: Path) -> None:
    install_temp_session_store(monkeypatch, tmp_path)
    client = TestClient(app)

    response = client.get('/api/session')

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['display_name'] == ''
    assert payload['screen'] == 'login'
    assert payload['artifact'] is None


def test_delete_session_clears_persisted_snapshot(monkeypatch, tmp_path: Path) -> None:
    store = install_temp_session_store(monkeypatch, tmp_path)
    store.save(
        store.get_session().model_copy(
            update={
                'display_name': 'Wei',
                'screen': 'workspace',
                'workspace_path': 'D:/Codex/Trading assistant',
                'recent_workspaces': ['D:/Codex/Trading assistant'],
            }
        )
    )
    client = TestClient(app)

    response = client.delete('/api/session')

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['display_name'] == ''
    assert payload['screen'] == 'login'
    assert payload['recent_workspaces'] == []
