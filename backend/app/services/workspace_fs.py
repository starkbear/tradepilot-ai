from pathlib import Path

from app.models.schemas import ApplyIssue, ApplyResult, FileChangeDraft, FileDraft


def validate_relative_path(workspace: Path, relative_path: str) -> Path:
    workspace = workspace.resolve()
    resolved = (workspace / relative_path).resolve()
    if resolved != workspace and workspace not in resolved.parents:
        raise ValueError('Target path is outside the workspace')
    return resolved


def build_issue(path: str, stage: str, kind: str, message: str, suggestion: str) -> ApplyIssue:
    return ApplyIssue(
        path=path,
        stage=stage,
        kind=kind,
        message=message,
        suggestion=suggestion,
    )


def validate_file_target(workspace: Path, file: FileDraft) -> tuple[Path | None, ApplyIssue | None]:
    try:
        target = validate_relative_path(workspace, file.path)
    except ValueError:
        return None, build_issue(
            file.path,
            'validation',
            'path_outside_workspace',
            'Target path is outside the selected workspace.',
            'Choose a path inside the selected workspace and try again.',
        )

    return target, None


def validate_change_target(workspace: Path, change: FileChangeDraft) -> tuple[Path | None, ApplyIssue | None]:
    try:
        target = validate_relative_path(workspace, change.path)
    except ValueError:
        return None, build_issue(
            change.path,
            'validation',
            'path_outside_workspace',
            'Target path is outside the selected workspace.',
            'Choose a path inside the selected workspace and try again.',
        )

    if not target.exists() or not target.is_file():
        return None, build_issue(
            change.path,
            'validation',
            'missing_target',
            'Target file does not exist for this change.',
            'Ensure the file exists in the workspace or regenerate the change against the current project state.',
        )

    if change.mode == 'patch':
        existing_content = target.read_text(encoding='utf-8')
        old_snippet = change.old_snippet or ''
        if existing_content.count(old_snippet) == 0:
            return None, build_issue(
                change.path,
                'validation',
                'snippet_not_found',
                'Generated patch no longer matches the current file content.',
                'Regenerate this change or preview the latest file state before applying again.',
            )

    return target, None


def apply_files(workspace_path: str, files: list[FileDraft]) -> ApplyResult:
    workspace = Path(workspace_path)
    workspace.mkdir(parents=True, exist_ok=True)
    validated: list[tuple[FileDraft, Path]] = []
    validated_paths: list[str] = []
    applied: list[str] = []
    skipped: list[str] = []
    issues: list[ApplyIssue] = []

    for file in files:
        if not file.selected:
            skipped.append(file.path)
            continue

        target, issue = validate_file_target(workspace, file)
        if issue:
            issues.append(issue)
            continue

        validated.append((file, target))
        validated_paths.append(file.path)

    for file, target in validated:
        try:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(file.content, encoding='utf-8')
            applied.append(file.path)
        except OSError:
            issues.append(
                build_issue(
                    file.path,
                    'apply',
                    'write_failed',
                    'Failed to write this file to disk.',
                    'Check file permissions and try again.',
                )
            )

    return ApplyResult(
        validated=validated_paths,
        applied=applied,
        applied_files=applied,
        skipped=skipped,
        issues=issues,
        errors=[],
    )


def apply_changes(workspace_path: str, changes: list[FileChangeDraft]) -> ApplyResult:
    workspace = Path(workspace_path)
    workspace.mkdir(parents=True, exist_ok=True)
    validated: list[tuple[FileChangeDraft, Path]] = []
    validated_paths: list[str] = []
    applied: list[str] = []
    skipped: list[str] = []
    issues: list[ApplyIssue] = []

    for change in changes:
        if not change.selected:
            skipped.append(change.path)
            continue

        target, issue = validate_change_target(workspace, change)
        if issue:
            issues.append(issue)
            continue

        validated.append((change, target))
        validated_paths.append(change.path)

    for change, target in validated:
        try:
            if change.mode == 'patch':
                existing_content = target.read_text(encoding='utf-8')
                old_snippet = change.old_snippet or ''
                if change.replace_all_matches:
                    updated_content = existing_content.replace(old_snippet, change.new_content)
                else:
                    updated_content = existing_content.replace(old_snippet, change.new_content, 1)
                target.write_text(updated_content, encoding='utf-8')
            else:
                target.write_text(change.new_content, encoding='utf-8')

            applied.append(change.path)
        except OSError:
            issues.append(
                build_issue(
                    change.path,
                    'apply',
                    'write_failed',
                    'Failed to write this change to disk.',
                    'Check file permissions and try again.',
                )
            )

    return ApplyResult(
        validated=validated_paths,
        applied=applied,
        applied_changes=applied,
        skipped=skipped,
        issues=issues,
        errors=[],
    )
