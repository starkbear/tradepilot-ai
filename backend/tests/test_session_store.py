from pathlib import Path

from app.models.schemas import ApplyResult, FileDraft, GenerationArtifact, PersistedSessionSnapshot
from app.services.session_store import SessionStore


def build_artifact(summary: str, file_path: str = 'README.md') -> GenerationArtifact:
    return GenerationArtifact(
        assistant_message='Here is your scaffold.',
        summary=summary,
        architecture='Frontend + backend split.',
        project_tree=['frontend/', 'backend/'],
        files=[
            FileDraft(
                path=file_path,
                purpose='project overview',
                content=f'# {summary}',
            )
        ],
        warnings=[],
        next_steps=['Review generated files'],
    )


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


def test_update_after_generate_records_generation_history_and_defaults(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')

    snapshot = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Build the first scaffold',
        artifact=build_artifact('First scaffold ready.', 'frontend/src/App.tsx'),
    )

    assert snapshot.artifact is not None
    assert snapshot.selected_file_paths == ['frontend/src/App.tsx']
    assert snapshot.selected_file_path == 'frontend/src/App.tsx'
    assert len(snapshot.generation_history) == 1
    assert snapshot.generation_history[0].goal == 'Build the first scaffold'
    assert snapshot.generation_history[0].summary == 'First scaffold ready.'
    assert snapshot.generation_history[0].artifact.summary == 'First scaffold ready.'
    assert snapshot.active_generation_id == snapshot.generation_history[0].id


def test_update_after_generate_caps_generation_history_at_five_entries(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')

    for index in range(6):
        store.update_after_generate(
            workspace_path='D:/Codex/Trading assistant',
            goal=f'Generation {index}',
            artifact=build_artifact(f'Summary {index}', f'file-{index}.md'),
        )

    snapshot = store.get_session()

    assert len(snapshot.generation_history) == 5
    assert [entry.goal for entry in snapshot.generation_history] == [
        'Generation 5',
        'Generation 4',
        'Generation 3',
        'Generation 2',
        'Generation 1',
    ]


def test_restore_generation_resets_active_state_from_history(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    first = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='First generation',
        artifact=build_artifact('Summary 1', 'frontend/src/App.tsx'),
    )
    first_entry_id = first.generation_history[0].id
    store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Second generation',
        artifact=build_artifact('Summary 2', 'backend/app/main.py'),
    )
    store.update_after_apply(ApplyResult(applied=['backend/app/main.py']))

    restored = store.restore_generation(first_entry_id)

    assert restored.goal == 'First generation'
    assert restored.artifact is not None
    assert restored.artifact.summary == 'Summary 1'
    assert restored.selected_file_paths == ['frontend/src/App.tsx']
    assert restored.selected_file_path == 'frontend/src/App.tsx'
    assert restored.apply_result is None
    assert restored.active_generation_id == first_entry_id


def test_restore_generation_raises_when_entry_missing(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')

    try:
        store.restore_generation('missing-entry')
    except KeyError as error:
        assert str(error) == "'generation history entry not found'"
    else:
        raise AssertionError('restore_generation should raise for missing history entry')


def test_delete_generation_removes_only_the_selected_history_entry(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    first = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='First generation',
        artifact=build_artifact('Summary 1', 'frontend/src/App.tsx'),
    )
    first_entry_id = first.generation_history[0].id
    store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Second generation',
        artifact=build_artifact('Summary 2', 'backend/app/main.py'),
    )

    updated = store.delete_generation(first_entry_id)

    assert [entry.goal for entry in updated.generation_history] == ['Second generation']
    assert updated.artifact is not None
    assert updated.artifact.summary == 'Summary 2'
    assert updated.active_generation_id == updated.generation_history[0].id


def test_delete_generation_clears_active_generation_id_when_active_entry_is_removed(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    generated = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Only generation',
        artifact=build_artifact('Summary 1', 'frontend/src/App.tsx'),
    )

    updated = store.delete_generation(generated.generation_history[0].id)

    assert updated.generation_history == []
    assert updated.active_generation_id is None


def test_clear_generation_history_keeps_the_active_artifact(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='First generation',
        artifact=build_artifact('Summary 1', 'frontend/src/App.tsx'),
    )
    store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Second generation',
        artifact=build_artifact('Summary 2', 'backend/app/main.py'),
    )

    updated = store.clear_generation_history()

    assert updated.generation_history == []
    assert updated.artifact is not None
    assert updated.artifact.summary == 'Summary 2'
    assert updated.active_generation_id is None


def test_update_after_apply_records_summary_on_active_generation(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    generated = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Dashboard scaffold',
        artifact=build_artifact('Summary 1', 'frontend/src/Dashboard.tsx'),
    )
    active_entry_id = generated.generation_history[0].id

    updated = store.update_after_apply(
        ApplyResult(
            validated=['frontend/src/Dashboard.tsx', 'backend/app/api/routes/dashboard.py'],
            applied=['frontend/src/Dashboard.tsx'],
            applied_files=['frontend/src/Dashboard.tsx'],
            applied_changes=[],
            skipped=['backend/app/api/routes/dashboard.py'],
            issues=[],
            errors=[],
        )
    )

    history_entry = next(entry for entry in updated.generation_history if entry.id == active_entry_id)

    assert history_entry.apply_summary is not None
    assert history_entry.apply_summary.validated_count == 2
    assert history_entry.apply_summary.applied_count == 1
    assert history_entry.apply_summary.applied_files_count == 1
    assert history_entry.apply_summary.applied_changes_count == 0
    assert history_entry.apply_summary.issue_count == 0
    assert history_entry.apply_summary.error_count == 0
    assert history_entry.apply_summary.last_applied_at.endswith('+00:00')


def test_update_after_apply_leaves_non_active_history_entries_unchanged(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    first = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='First generation',
        artifact=build_artifact('Summary 1', 'frontend/src/App.tsx'),
    )
    first_entry_id = first.generation_history[0].id
    store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Second generation',
        artifact=build_artifact('Summary 2', 'backend/app/main.py'),
    )

    updated = store.update_after_apply(
        ApplyResult(
            validated=['backend/app/main.py'],
            applied=['backend/app/main.py'],
            applied_files=['backend/app/main.py'],
            applied_changes=[],
            skipped=[],
            issues=[],
            errors=[],
        )
    )

    first_entry = next(entry for entry in updated.generation_history if entry.id == first_entry_id)
    active_entry = next(entry for entry in updated.generation_history if entry.id != first_entry_id)

    assert first_entry.apply_summary is None
    assert active_entry.apply_summary is not None
    assert active_entry.apply_summary.applied_files_count == 1


def test_update_after_apply_keeps_history_unchanged_when_no_active_generation_exists(tmp_path: Path) -> None:
    store = SessionStore(tmp_path / '.local' / 'session.json')
    generated = store.update_after_generate(
        workspace_path='D:/Codex/Trading assistant',
        goal='Only generation',
        artifact=build_artifact('Summary 1', 'frontend/src/App.tsx'),
    )
    entry_id = generated.generation_history[0].id
    store.save(store.get_session().model_copy(update={'active_generation_id': None}))

    updated = store.update_after_apply(
        ApplyResult(
            validated=['frontend/src/App.tsx'],
            applied=['frontend/src/App.tsx'],
            applied_files=['frontend/src/App.tsx'],
            applied_changes=[],
            skipped=[],
            issues=[],
            errors=[],
        )
    )

    history_entry = next(entry for entry in updated.generation_history if entry.id == entry_id)

    assert updated.apply_result is not None
    assert history_entry.apply_summary is None
