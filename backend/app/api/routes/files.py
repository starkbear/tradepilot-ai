from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.schemas import ApplyFilesRequest, ApplyResult, ReadFileRequest, ReadFileResult
from app.services.workspace_fs import apply_changes, apply_files, validate_relative_path

router = APIRouter(prefix='/api/files', tags=['files'])


@router.post('/read')
def read_selected_file(payload: ReadFileRequest) -> dict:
    workspace = Path(payload.workspace_path)

    try:
        target = validate_relative_path(workspace, payload.path)
    except ValueError as exc:
        return JSONResponse(
            status_code=400,
            content={
                'success': False,
                'message': str(exc),
                'data': None,
                'errors': [str(exc)],
            },
        )

    if not target.exists() or not target.is_file():
        message = 'Target file does not exist.'
        return JSONResponse(
            status_code=404,
            content={
                'success': False,
                'message': message,
                'data': None,
                'errors': [message],
            },
        )

    result = ReadFileResult(path=payload.path, content=target.read_text(encoding='utf-8'))
    return {
        'success': True,
        'message': 'file loaded',
        'data': result.model_dump(),
        'errors': [],
    }


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
