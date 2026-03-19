from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


def test_apply_selected_files_supports_mixed_files_and_changes(tmp_path: Path) -> None:
    existing_file = tmp_path / 'backend' / 'app' / 'main.py'
    existing_file.parent.mkdir(parents=True)
    existing_file.write_text('app = FastAPI()\n', encoding='utf-8')

    rewrite_file = tmp_path / 'frontend' / 'src' / 'App.tsx'
    rewrite_file.parent.mkdir(parents=True)
    rewrite_file.write_text('export function App() { return null }', encoding='utf-8')

    client = TestClient(app)
    response = client.post(
        '/api/files/apply',
        json={
            'workspace_path': str(tmp_path),
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
                    'reason': 'Register router.',
                    'old_snippet': 'app = FastAPI()\n',
                    'new_content': 'app = FastAPI()\napp.include_router(router)\n',
                    'selected': True,
                },
                {
                    'path': 'frontend/src/App.tsx',
                    'mode': 'rewrite',
                    'reason': 'Replace app shell.',
                    'new_content': 'export function App() { return <main /> }',
                    'selected': True,
                },
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()['data']
    assert 'README.md' in payload['applied']
    assert 'backend/app/main.py' in payload['applied_changes']
    assert 'frontend/src/App.tsx' in payload['applied_changes']
    assert (tmp_path / 'README.md').read_text(encoding='utf-8') == '# Demo'
    assert existing_file.read_text(encoding='utf-8') == 'app = FastAPI()\napp.include_router(router)\n'
    assert rewrite_file.read_text(encoding='utf-8') == 'export function App() { return <main /> }'
