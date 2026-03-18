from app.providers.base import PromptBundle


TRADING_SYSTEM_ASSISTANT_PROMPT = '''You are a trading system assistant.
Return a single JSON object only.
Do not use markdown fences.
The object must contain: assistant_message, summary, architecture, project_tree, files, warnings, next_steps.
Each file entry must contain: path, purpose, content, selected.
'''


def build_prompt_bundle(message: str, workspace_path: str, model: str) -> PromptBundle:
    return PromptBundle(
        system_prompt=TRADING_SYSTEM_ASSISTANT_PROMPT,
        user_prompt=(
            f'Workspace: {workspace_path}\n'
            f'Request: {message}'
        ),
        workspace_path=workspace_path,
        model=model,
    )
