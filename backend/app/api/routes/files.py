from fastapi import APIRouter

from app.models.schemas import ApplyFilesRequest
from app.services.workspace_fs import apply_files

router = APIRouter(prefix='/api/files', tags=['files'])


@router.post('/apply')
def apply_selected_files(payload: ApplyFilesRequest) -> dict:
    result = apply_files(payload.workspace_path, payload.files)
    return {
        'success': True,
        'message': 'files applied',
        'data': result.model_dump(),
        'errors': [],
    }
