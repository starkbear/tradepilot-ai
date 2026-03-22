from fastapi import APIRouter

from app.models.schemas import LoginRequest
from app.services.session_store import session_store

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.post('/login')
def login(payload: LoginRequest) -> dict:
    session = session_store.login(payload.display_name)
    return {
        'success': True,
        'message': 'logged in',
        'data': session.model_dump(mode='json'),
        'errors': [],
    }
