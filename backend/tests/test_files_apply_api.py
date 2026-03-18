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



def test_apply_overwrites_existing_files(tmp_path) -> None:
    client = TestClient(app)
    target = tmp_path / 'keep.txt'
    target.write_text('old', encoding='utf-8')

    response = client.post(
        '/api/files/apply',
        json={
            'workspace_path': str(tmp_path),
            'files': [
                {'path': 'keep.txt', 'purpose': 'keep', 'content': 'new', 'selected': True},
            ],
        },
    )

    assert response.status_code == 200
    assert target.read_text(encoding='utf-8') == 'new'
