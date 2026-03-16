from app.models.schemas import LocalUserSession


class SessionStore:
    def __init__(self) -> None:
        self._session = LocalUserSession(display_name='Guest')

    def login(self, display_name: str) -> LocalUserSession:
        self._session = LocalUserSession(display_name=display_name)
        return self._session

    def get_session(self) -> LocalUserSession:
        return self._session


session_store = SessionStore()
