from pathlib import Path

from app.models.schemas import ApplyResult, FileDraft


def validate_relative_path(workspace: Path, relative_path: str) -> Path:
    workspace = workspace.resolve()
    resolved = (workspace / relative_path).resolve()
    if resolved != workspace and workspace not in resolved.parents:
        raise ValueError('Target path is outside the workspace')
    return resolved


def apply_files(workspace_path: str, files: list[FileDraft]) -> ApplyResult:
    workspace = Path(workspace_path)
    workspace.mkdir(parents=True, exist_ok=True)
    applied: list[str] = []
    skipped: list[str] = []

    for file in files:
        if not file.selected:
            skipped.append(file.path)
            continue

        target = validate_relative_path(workspace, file.path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(file.content, encoding='utf-8')
        applied.append(file.path)

    return ApplyResult(applied=applied, skipped=skipped, errors=[])
