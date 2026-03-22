from pathlib import Path

from app.models.schemas import PersistedSessionSnapshot
from app.services.session_store import SessionStore


def test_session_store_returns_default_snapshot_when_file_missing(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')

    snapshot = store.get_session()

    assert snapshot.display_name == ''
    assert snapshot.screen == 'login'
    assert snapshot.workspace_path == ''
    assert snapshot.artifact is None
    assert snapshot.apply_result is None


def test_session_store_persists_and_reloads_snapshot(tmp_path: Path) -> None:
    session_file = tmp_path / '.local' / 'session.json'
    store = SessionStore(session_file)
    snapshot = PersistedSessionSnapshot(
        display_name='Wei',
        screen='workspace',
        workspace_path='D:/Codex/Trading assistant',
        goal='Continue improving the trading assistant',
        selected_file_paths=['README.md'],
    )

    store.save(snapshot)

    reloaded = SessionStore(session_file).get_session()
    assert reloaded.display_name == 'Wei'
    assert reloaded.screen == 'workspace'
    assert reloaded.workspace_path == 'D:/Codex/Trading assistant'
    assert reloaded.goal == 'Continue improving the trading assistant'
    assert reloaded.selected_file_paths == ['README.md']


def test_session_store_clear_resets_snapshot_and_removes_file(tmp_path: Path) -> None:
    session_file = tmp_path / '.local' / 'session.json'
    store = SessionStore(session_file)
    store.save(
        PersistedSessionSnapshot(
            display_name='Wei',
            screen='workspace',
            workspace_path='D:/Codex/Trading assistant',
        )
    )

    cleared = store.clear()

    assert cleared.display_name == ''
    assert cleared.screen == 'login'
    assert cleared.workspace_path == ''
    assert not session_file.exists()
