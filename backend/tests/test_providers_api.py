from fastapi.testclient import TestClient
from app.main import app


def test_providers_endpoint_returns_openai_first() -> None:
    client = TestClient(app)

    response = client.get('/api/providers')

    assert response.status_code == 200
    providers = response.json()['data']['providers']
    assert providers[0]['id'] == 'openai'
    assert providers[0]['enabled'] is True
