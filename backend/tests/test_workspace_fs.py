from pathlib import Path

from app.services.workspace_fs import validate_relative_path


def test_validate_relative_path_rejects_escape() -> None:
    workspace = Path('D:/Codex/Trading assistant')

    try:
        validate_relative_path(workspace, '../outside.txt')
    except ValueError as exc:
        assert 'outside the workspace' in str(exc)
    else:
        raise AssertionError('expected ValueError')
