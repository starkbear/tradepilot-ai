from app.services.orchestrator import TRADING_SYSTEM_ASSISTANT_PROMPT, build_prompt_bundle


SAMPLE_CONTEXT = {
    'workspace_summary': 'React frontend + FastAPI backend with existing providers and services.',
    'directory_snapshot': ['backend/', 'frontend/', 'docs/'],
    'key_files': [
        {
            'path': 'backend/app/main.py',
            'reason_selected': 'Primary backend application entrypoint.',
            'content_excerpt': 'from fastapi import FastAPI\napp = FastAPI()\n',
        }
    ],
    'generation_guidance': [
        'The repository already exists.',
        'Prefer extending existing modules over recreating entrypoints.',
        'Align generated files with the detected stack and folder structure.',
    ],
}


def test_trading_system_prompt_requires_array_shapes_and_file_object_entries() -> None:
    assert 'project_tree must be an array of strings' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'warnings must be an array of strings' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'next_steps must be an array of strings' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'files must be an array of objects' in TRADING_SYSTEM_ASSISTANT_PROMPT
    assert 'path, purpose, content, selected' in TRADING_SYSTEM_ASSISTANT_PROMPT



def test_build_prompt_bundle_embeds_workspace_summary_and_snapshot() -> None:
    bundle = build_prompt_bundle(
        message='Add a backtesting module.',
        workspace_path='D:/Codex/Trading assistant',
        model='gpt-4.1',
        workspace_context=SAMPLE_CONTEXT,
    )

    assert 'Workspace Summary:' in bundle.user_prompt
    assert SAMPLE_CONTEXT['workspace_summary'] in bundle.user_prompt
    assert 'backend/' in bundle.user_prompt
    assert 'frontend/' in bundle.user_prompt



def test_build_prompt_bundle_adds_incremental_generation_guidance() -> None:
    bundle = build_prompt_bundle(
        message='Extend the current trading assistant.',
        workspace_path='D:/Codex/Trading assistant',
        model='gpt-4.1',
        workspace_context=SAMPLE_CONTEXT,
    )

    assert 'The repository already exists.' in bundle.user_prompt
    assert 'Prefer extending existing modules over recreating entrypoints.' in bundle.user_prompt
    assert 'Align generated files with the detected stack and folder structure.' in bundle.user_prompt
