from app.services.orchestrator import TRADING_SYSTEM_ASSISTANT_PROMPT


def test_trading_system_prompt_requires_array_shapes_and_file_object_entries() -> None:
    assert 'project_tree must be an array of strings' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'warnings must be an array of strings' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'next_steps must be an array of strings' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'files must be an array of objects' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'path, purpose, content, selected' in TRADING_SYSTEM_ASSISTANT_PROMPT