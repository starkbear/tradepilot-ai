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
    assert result.validated == ['backend/app/main.py']
    assert result.applied_changes == ['backend/app/main.py']


def test_apply_changes_reports_validation_issue_when_patch_target_is_missing(tmp_path: Path) -> None:
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

    assert result.validated == []
    assert result.applied_changes == []
    assert result.issues[0].stage == 'validation'
    assert result.issues[0].kind == 'missing_target'
    assert result.issues[0].path == 'backend/app/main.py'


def test_apply_changes_reports_validation_issue_when_patch_snippet_is_missing(tmp_path: Path) -> None:
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
                old_snippet='missing\n',
                new_content='app.include_router(router)\n',
                selected=True,
            )
        ],
    )

    assert result.validated == []
    assert result.applied_changes == []
    assert result.issues[0].stage == 'validation'
    assert result.issues[0].kind == 'snippet_not_found'
    assert result.issues[0].path == 'backend/app/main.py'


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
    assert result.validated == ['frontend/src/App.tsx']
    assert result.applied_changes == ['frontend/src/App.tsx']


def test_apply_changes_only_applies_valid_selected_items(tmp_path: Path) -> None:
    valid_target = tmp_path / 'backend' / 'app' / 'main.py'
    valid_target.parent.mkdir(parents=True)
    valid_target.write_text('app = FastAPI()\n', encoding='utf-8')

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
            ),
            FileChangeDraft(
                path='frontend/src/App.tsx',
                mode='patch',
                reason='Update app shell.',
                old_snippet='missing\n',
                new_content='replacement\n',
                selected=True,
            ),
        ],
    )

    assert valid_target.read_text(encoding='utf-8') == 'app = FastAPI()\napp.include_router(router)\n'
    assert result.validated == ['backend/app/main.py']
    assert result.applied_changes == ['backend/app/main.py']
    assert result.issues[0].path == 'frontend/src/App.tsx'
    assert result.issues[0].kind == 'missing_target'


def test_validate_relative_path_still_rejects_path_outside_workspace(tmp_path: Path) -> None:
    with pytest.raises(ValueError):
        validate_relative_path(tmp_path, '../outside.txt')
