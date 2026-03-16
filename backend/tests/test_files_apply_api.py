from fastapi.testclient import TestClient
from app.main import app


def test_apply_writes_only_selected_files(tmp_path) -> None:
    client = TestClient(app)

    response = client.post(
        '/api/files/apply',
        json={
            'workspace_path': str(tmp_path),
            'files': [
                {'path': 'keep.txt', 'purpose': 'keep', 'content': 'A', 'selected': True},
                {'path': 'skip.txt', 'purpose': 'skip', 'content': 'B', 'selected': False},
            ],
        },
    )

    assert response.status_code == 200
    assert (tmp_path / 'keep.txt').read_text() == 'A'
    assert not (tmp_path / 'skip.txt').exists()
