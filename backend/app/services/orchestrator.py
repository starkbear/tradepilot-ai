from app.providers.base import PromptBundle


TRADING_SYSTEM_ASSISTANT_PROMPT = '''You are a trading system assistant. Return structured JSON only.'''


def build_prompt_bundle(message: str, workspace_path: str, model: str) -> PromptBundle:
    return PromptBundle(
        system_prompt=TRADING_SYSTEM_ASSISTANT_PROMPT,
        user_prompt=message,
        workspace_path=workspace_path,
        model=model,
    )
