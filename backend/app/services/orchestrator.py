from app.providers.base import PromptBundle


TRADING_SYSTEM_ASSISTANT_PROMPT = '''You are a trading system assistant.
Return a single JSON object only.
Do not use markdown fences.
Do not include any prose before or after the JSON object.
The object must contain: assistant_message, summary, architecture, project_tree, files, warnings, next_steps.
summary and architecture must be non-empty strings.
project_tree must be an array of strings.
warnings must be an array of strings.
next_steps must be an array of strings.
files must be an array of objects.
Each file entry must contain: path, purpose, content, selected.
If there are no files, return an empty array for files.
'''


def build_prompt_bundle(
    message: str,
    workspace_path: str,
    model: str,
    workspace_context: dict | None = None,
) -> PromptBundle:
    context_block = _format_workspace_context(workspace_context or {})
    user_prompt = (
        f'Workspace: {workspace_path}\n'
        f'Request: {message}'
    )
    if context_block:
        user_prompt = f'{user_prompt}\n\n{context_block}'

    return PromptBundle(
        system_prompt=TRADING_SYSTEM_ASSISTANT_PROMPT,
        user_prompt=user_prompt,
        workspace_path=workspace_path,
        model=model,
    )


def _format_workspace_context(workspace_context: dict) -> str:
    if not workspace_context:
        return ''

    lines: list[str] = []
    workspace_summary = workspace_context.get('workspace_summary')
    if workspace_summary:
        lines.append('Workspace Summary:')
        lines.append(str(workspace_summary))

    directory_snapshot = workspace_context.get('directory_snapshot') or []
    if directory_snapshot:
        lines.append('Directory Snapshot:')
        lines.extend(f'- {entry}' for entry in directory_snapshot)

    key_files = workspace_context.get('key_files') or []
    if key_files:
        lines.append('Key Files:')
        for item in key_files:
            path = item.get('path', 'unknown')
            reason = item.get('reason_selected', '')
            excerpt = item.get('content_excerpt', '')
            lines.append(f'- {path}: {reason}')
            if excerpt:
                lines.append(f'  Excerpt: {excerpt}')

    guidance = workspace_context.get('generation_guidance') or []
    if guidance:
        lines.append('Incremental Guidance:')
        lines.extend(f'- {entry}' for entry in guidance)

    return '\n'.join(lines)
