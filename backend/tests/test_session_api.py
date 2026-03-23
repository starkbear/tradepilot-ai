from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import FileDraft, GenerationArtifact
from app.services.session_store import SessionStore


def install_temp_session_store(monkeypatch, tmp_path: Path) -> SessionStore:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    monkeypatch.setattr('app.api.routes.auth.session_store', store)
    monkeypatch.setattr('app.api.routes.chat.session_store', store)
    monkeypatch.setattr('app.api.routes.files.session_store', store)
    monkeypatch.setattr('app.api.routes.session.session_store', store)
    return store


def build_artifact(summary: str) -> GenerationArtifact:
    return GenerationArtifact(
        assistant_message='Here is your scaffold.',
        summary=summary,
        architecture='Frontend + backend split.',
        project_tree=['frontend/', 'backend/'],
        files=[FileDraft(path='README.md', purpose='project overview', content='# Demo')],
        warnings=[],
        next_steps=['Review generated files'],
    )


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


def test_restore_generation_returns_updated_snapshot(monkeypatch, tmp_path: Path) -> None:
    store = install_temp_session_store(monkeypatch, tmp_path)
    generated = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Initial scaffold',
        artifact=build_artifact('Initial summary'),
    )
    history_entry_id = generated.generation_history[0].id
    client = TestClient(app)

    response = client.post('/api/session/restore-generation', json={'generation_id': history_entry_id})

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['goal'] == 'Initial scaffold'
    assert payload['artifact']['summary'] == 'Initial summary'
    assert payload['selected_file_paths'] == ['README.md']
    assert payload['active_generation_id'] == history_entry_id


def test_restore_generation_returns_404_when_entry_missing(monkeypatch, tmp_path: Path) -> None:
    install_temp_session_store(monkeypatch, tmp_path)
    client = TestClient(app)

    response = client.post('/api/session/restore-generation', json={'generation_id': 'missing-entry'})

    assert response.status_code == 404
    assert 'not found' in response.json()['message']


def test_delete_generation_returns_updated_snapshot(monkeypatch, tmp_path: Path) -> None:
    store = install_temp_session_store(monkeypatch, tmp_path)
    generated = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Initial scaffold',
        artifact=build_artifact('Initial summary'),
    )
    history_entry_id = generated.generation_history[0].id
    client = TestClient(app)

    response = client.delete(f'/api/session/generations/{history_entry_id}')

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['generation_history'] == []
    assert payload['artifact']['summary'] == 'Initial summary'
    assert payload['active_generation_id'] is None


def test_delete_generation_returns_404_when_entry_missing(monkeypatch, tmp_path: Path) -> None:
    install_temp_session_store(monkeypatch, tmp_path)
    client = TestClient(app)

    response = client.delete('/api/session/generations/missing-entry')

    assert response.status_code == 404
    assert 'not found' in response.json()['message']


def test_clear_generation_history_returns_updated_snapshot(monkeypatch, tmp_path: Path) -> None:
    store = install_temp_session_store(monkeypatch, tmp_path)
    store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Initial scaffold',
        artifact=build_artifact('Initial summary'),
    )
    client = TestClient(app)

    response = client.delete('/api/session/generations')

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['generation_history'] == []
    assert payload['artifact']['summary'] == 'Initial summary'
    assert payload['active_generation_id'] is None
