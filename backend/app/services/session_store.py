import json
from pathlib import Path

from app.models.schemas import ApplyResult, GenerationArtifact, PersistedSessionSnapshot


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
        session = self._session.model_copy(
            update={
                'screen': 'workspace',
                'workspace_path': workspace_path,
                'goal': goal,
                'artifact': artifact,
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

    def get_session(self) -> PersistedSessionSnapshot:
        return self._session


session_store = SessionStore()
