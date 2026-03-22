from fastapi import APIRouter

from app.services.session_store import session_store

router = APIRouter(prefix='/api/session', tags=['session'])


@router.get('')
def get_session() -> dict:
    return {
        'success': True,
        'message': 'session loaded',
        'data': session_store.get_session().model_dump(mode='json'),
        'errors': [],
    }
