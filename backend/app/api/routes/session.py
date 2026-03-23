from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.schemas import RestoreGenerationRequest
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


@router.delete('')
def clear_session() -> dict:
    return {
        'success': True,
        'message': 'session cleared',
        'data': session_store.clear().model_dump(mode='json'),
        'errors': [],
    }


@router.post('/restore-generation')
def restore_generation(payload: RestoreGenerationRequest) -> dict:
    try:
        session = session_store.restore_generation(payload.generation_id)
    except KeyError:
        return JSONResponse(
            status_code=404,
            content={
                'success': False,
                'message': 'generation history entry not found',
                'data': None,
                'errors': ['generation history entry not found'],
            },
        )

    return {
        'success': True,
        'message': 'generation restored',
        'data': session.model_dump(mode='json'),
        'errors': [],
    }
