from fastapi.testclient import TestClient
from app.main import app


def test_login_persists_local_session() -> None:
    client = TestClient(app)

    response = client.post('/api/auth/login', json={'display_name': 'Wei'})

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['display_name'] == 'Wei'
    assert payload['recent_workspaces'] == []
    assert payload['screen'] == 'workspace'
