from fastapi import APIRouter

from app.models.schemas import ApplyFilesRequest, ApplyResult
from app.services.workspace_fs import apply_changes, apply_files

router = APIRouter(prefix='/api/files', tags=['files'])


@router.post('/apply')
def apply_selected_files(payload: ApplyFilesRequest) -> dict:
    change_result = apply_changes(payload.workspace_path, payload.changes)
    file_result = apply_files(payload.workspace_path, payload.files)
    result = ApplyResult(
        validated=change_result.validated + file_result.validated,
        applied=change_result.applied + file_result.applied,
        applied_files=file_result.applied_files,
        applied_changes=change_result.applied_changes,
        skipped=change_result.skipped + file_result.skipped,
        issues=change_result.issues + file_result.issues,
        errors=change_result.errors + file_result.errors,
    )
    return {
        'success': True,
        'message': 'files applied',
        'data': result.model_dump(),
        'errors': [],
    }
