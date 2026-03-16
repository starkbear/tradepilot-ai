from fastapi import APIRouter

import app.providers.factory as provider_factory
from app.models.schemas import GenerationRequest
from app.services.artifacts import normalize_generation
from app.services.orchestrator import build_prompt_bundle

router = APIRouter(prefix='/api/chat', tags=['chat'])


@router.post('/generate')
def generate(payload: GenerationRequest) -> dict:
    provider = provider_factory.get_provider(payload.provider_id)
    prompt_bundle = build_prompt_bundle(
        message=payload.message,
        workspace_path=payload.workspace_path,
        model=payload.model,
    )
    raw = provider.generate(prompt_bundle)
    artifact = normalize_generation(raw)
    return {
        'success': True,
        'message': 'generation complete',
        'data': artifact.model_dump(),
        'errors': [],
    }
