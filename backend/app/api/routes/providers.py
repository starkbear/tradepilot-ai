from fastapi import APIRouter

from app.core.config import get_provider_catalog

router = APIRouter(prefix='/api/providers', tags=['providers'])


@router.get('')
def list_providers() -> dict:
    providers = get_provider_catalog()
    return {
        'success': True,
        'message': 'providers loaded',
        'data': {'providers': [provider.model_dump() for provider in providers]},
        'errors': [],
    }
