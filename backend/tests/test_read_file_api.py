from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


def test_read_file_returns_current_content(tmp_path: Path) -> None:
    target = tmp_path / 'frontend' / 'src' / 'App.tsx'
    target.parent.mkdir(parents=True)
    target.write_text('export function App() { return null }', encoding='utf-8')

    client = TestClient(app)
    response = client.post(
        '/api/files/read',
        json={
            'workspace_path': str(tmp_path),
            'path': 'frontend/src/App.tsx',
        },
    )

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['path'] == 'frontend/src/App.tsx'
    assert payload['content'] == 'export function App() { return null }'


def test_read_file_rejects_missing_target(tmp_path: Path) -> None:
    client = TestClient(app)
    response = client.post(
        '/api/files/read',
        json={
            'workspace_path': str(tmp_path),
            'path': 'frontend/src/App.tsx',
        },
    )

    assert response.status_code == 404
    assert response.json()['success'] is False


def test_read_file_rejects_path_outside_workspace(tmp_path: Path) -> None:
    client = TestClient(app)
    response = client.post(
        '/api/files/read',
        json={
            'workspace_path': str(tmp_path),
            'path': '../outside.txt',
        },
    )

    assert response.status_code == 400
    assert response.json()['success'] is False
