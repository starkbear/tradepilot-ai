import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from app.models.schemas import ApplyResult, GenerationArtifact, GenerationHistoryEntry, PersistedSessionSnapshot

MAX_GENERATION_HISTORY = 5


class SessionStore:
    def __init__(self, storage_path: Path | None = None) -> None:
        self._storage_path = storage_path or Path(__file__).resolve().parents[3] / '.local' / 'session.json'
        self._session = self._load()

    def _default(self) -> PersistedSessionSnapshot:
        return PersistedSessionSnapshot()

    def _load(self) -> PersistedSessionSnapshot:
        if not self._storage_path.exists():
            return self._default()

        try:
            payload = json.loads(self._storage_path.read_text(encoding='utf-8'))
            return PersistedSessionSnapshot.model_validate(payload)
        except (OSError, ValueError, TypeError):
            return self._default()

    def save(self, session: PersistedSessionSnapshot) -> PersistedSessionSnapshot:
        self._session = session
        self._storage_path.parent.mkdir(parents=True, exist_ok=True)
        self._storage_path.write_text(
            json.dumps(self._session.model_dump(mode='json'), ensure_ascii=True, indent=2),
            encoding='utf-8',
        )
        return self._session

    def login(self, display_name: str) -> PersistedSessionSnapshot:
        session = self._session.model_copy(
            update={
                'display_name': display_name,
                'screen': 'workspace',
            }
        )
        return self.save(session)

    def update_after_generate(self, workspace_path: str, goal: str, artifact: GenerationArtifact) -> PersistedSessionSnapshot:
        recent_workspaces = [workspace_path, *[item for item in self._session.recent_workspaces if item != workspace_path]]
        history_entry = GenerationHistoryEntry(
            id=uuid4().hex,
            created_at=datetime.now(timezone.utc).isoformat(),
            goal=goal,
            summary=artifact.summary,
            artifact=artifact,
        )
        session = self._session.model_copy(
            update={
                'screen': 'workspace',
                'workspace_path': workspace_path,
                'goal': goal,
                'artifact': artifact,
                'active_generation_id': history_entry.id,
                'generation_history': [history_entry, *self._session.generation_history][:MAX_GENERATION_HISTORY],
                'selected_file_paths': [file.path for file in artifact.files],
                'selected_change_paths': [change.path for change in artifact.changes],
                'selected_file_path': artifact.files[0].path if artifact.files else None,
                'selected_change_path': None,
                'apply_result': None,
                'recent_workspaces': recent_workspaces[:10],
            }
        )
        return self.save(session)

    def update_after_apply(self, apply_result: ApplyResult) -> PersistedSessionSnapshot:
        session = self._session.model_copy(update={'apply_result': apply_result})
        return self.save(session)

    def restore_generation(self, generation_id: str) -> PersistedSessionSnapshot:
        entry = next((item for item in self._session.generation_history if item.id == generation_id), None)
        if entry is None:
            raise KeyError('generation history entry not found')

        artifact = entry.artifact
        session = self._session.model_copy(
            update={
                'screen': 'workspace',
                'goal': entry.goal,
                'artifact': artifact,
                'active_generation_id': entry.id,
                'selected_file_paths': [file.path for file in artifact.files],
                'selected_change_paths': [change.path for change in artifact.changes],
                'selected_file_path': artifact.files[0].path if artifact.files else None,
                'selected_change_path': None,
                'apply_result': None,
            }
        )
        return self.save(session)

    def delete_generation(self, generation_id: str) -> PersistedSessionSnapshot:
        if not any(item.id == generation_id for item in self._session.generation_history):
            raise KeyError('generation history entry not found')

        active_generation_id = self._session.active_generation_id
        if active_generation_id == generation_id:
            active_generation_id = None

        session = self._session.model_copy(
            update={
                'active_generation_id': active_generation_id,
                'generation_history': [
                    item for item in self._session.generation_history if item.id != generation_id
                ]
            }
        )
        return self.save(session)

    def clear_generation_history(self) -> PersistedSessionSnapshot:
        session = self._session.model_copy(update={'generation_history': [], 'active_generation_id': None})
        return self.save(session)

    def get_session(self) -> PersistedSessionSnapshot:
        return self._session

    def clear(self) -> PersistedSessionSnapshot:
        self._session = self._default()
        try:
            if self._storage_path.exists():
                self._storage_path.unlink()
        except OSError:
            self.save(self._session)
        return self._session


session_store = SessionStore()
