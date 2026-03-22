from fastapi import APIRouter

import app.providers.factory as provider_factory
from app.models.schemas import GenerationRequest
from app.services.artifacts import normalize_generation
from app.services.orchestrator import build_prompt_bundle
from app.services.session_store import session_store
from app.services.workspace_context import build_workspace_context

router = APIRouter(prefix='/api/chat', tags=['chat'])


@router.post('/generate')
def generate(payload: GenerationRequest) -> dict:
    provider = provider_factory.get_provider(payload.provider_id)
    workspace_context = build_workspace_context(payload.workspace_path)
    prompt_bundle = build_prompt_bundle(
        message=payload.message,
        workspace_path=payload.workspace_path,
        model=payload.model,
        workspace_context=workspace_context,
    )
    raw = provider.generate(prompt_bundle)
    artifact = normalize_generation(raw)
    session_store.update_after_generate(payload.workspace_path, payload.message, artifact)
    return {
        'success': True,
        'message': 'generation complete',
        'data': artifact.model_dump(mode='json'),
        'errors': [],
    }
