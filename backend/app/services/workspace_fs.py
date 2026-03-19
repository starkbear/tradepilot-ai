from pathlib import Path

from app.models.schemas import ApplyResult, FileChangeDraft, FileDraft


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

    return ApplyResult(applied=applied, applied_files=applied, skipped=skipped, errors=[])


def apply_changes(workspace_path: str, changes: list[FileChangeDraft]) -> ApplyResult:
    workspace = Path(workspace_path)
    workspace.mkdir(parents=True, exist_ok=True)
    applied: list[str] = []
    skipped: list[str] = []

    for change in changes:
        if not change.selected:
            skipped.append(change.path)
            continue

        target = validate_relative_path(workspace, change.path)
        if not target.exists() or not target.is_file():
            raise ValueError(f'Target file does not exist for change: {change.path}')

        existing_content = target.read_text(encoding='utf-8')
        if change.mode == 'patch':
            old_snippet = change.old_snippet or ''
            match_count = existing_content.count(old_snippet)
            if match_count == 0:
                raise ValueError(f'patch old_snippet not found for {change.path}')
            if not change.replace_all_matches and match_count > 1:
                updated_content = existing_content.replace(old_snippet, change.new_content, 1)
            elif change.replace_all_matches:
                updated_content = existing_content.replace(old_snippet, change.new_content)
            else:
                updated_content = existing_content.replace(old_snippet, change.new_content, 1)
            target.write_text(updated_content, encoding='utf-8')
        else:
            target.write_text(change.new_content, encoding='utf-8')

        applied.append(change.path)

    return ApplyResult(applied=applied, applied_changes=applied, skipped=skipped, errors=[])
