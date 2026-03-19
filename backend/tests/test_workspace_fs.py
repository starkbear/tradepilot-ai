from pathlib import Path

import pytest

from app.models.schemas import FileChangeDraft
from app.services.workspace_fs import apply_changes, validate_relative_path


def test_apply_changes_replaces_exact_patch_snippet(tmp_path: Path) -> None:
    target = tmp_path / 'backend' / 'app' / 'main.py'
    target.parent.mkdir(parents=True)
    target.write_text('app = FastAPI()\n', encoding='utf-8')

    result = apply_changes(
        str(tmp_path),
        [
            FileChangeDraft(
                path='backend/app/main.py',
                mode='patch',
                reason='Register router.',
                old_snippet='app = FastAPI()\n',
                new_content='app = FastAPI()\napp.include_router(router)\n',
                selected=True,
            )
        ],
    )

    assert target.read_text(encoding='utf-8') == 'app = FastAPI()\napp.include_router(router)\n'
    assert result.applied_changes == ['backend/app/main.py']


def test_apply_changes_fails_when_patch_snippet_is_missing(tmp_path: Path) -> None:
    target = tmp_path / 'backend' / 'app' / 'main.py'
    target.parent.mkdir(parents=True)
    target.write_text('app = FastAPI()\n', encoding='utf-8')

    with pytest.raises(ValueError, match='old_snippet'):
        apply_changes(
            str(tmp_path),
            [
                FileChangeDraft(
                    path='backend/app/main.py',
                    mode='patch',
                    reason='Register router.',
                    old_snippet='missing\n',
                    new_content='app.include_router(router)\n',
                    selected=True,
                )
            ],
        )


def test_apply_changes_rewrites_existing_file(tmp_path: Path) -> None:
    target = tmp_path / 'frontend' / 'src' / 'App.tsx'
    target.parent.mkdir(parents=True)
    target.write_text('export function App() { return null }', encoding='utf-8')

    result = apply_changes(
        str(tmp_path),
        [
            FileChangeDraft(
                path='frontend/src/App.tsx',
                mode='rewrite',
                reason='Replace app shell.',
                new_content='export function App() { return <main /> }',
                selected=True,
            )
        ],
    )

    assert target.read_text(encoding='utf-8') == 'export function App() { return <main /> }'
    assert result.applied_changes == ['frontend/src/App.tsx']


def test_validate_relative_path_still_rejects_path_outside_workspace(tmp_path: Path) -> None:
    with pytest.raises(ValueError):
        validate_relative_path(tmp_path, '../outside.txt')
