from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.services.session_store import SessionStore


def install_temp_session_store(monkeypatch, tmp_path: Path) -> SessionStore:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    monkeypatch.setattr('app.api.routes.auth.session_store', store)
    return store


def test_login_persists_local_session(monkeypatch, tmp_path: Path) -> None:
    install_temp_session_store(monkeypatch, tmp_path)
    client = TestClient(app)

    response = client.post('/api/auth/login', json={'display_name': 'Wei'})

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['display_name'] == 'Wei'
    assert payload['recent_workspaces'] == []
    assert payload['screen'] == 'workspace'
