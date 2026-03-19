import pytest

from app.services.artifacts import normalize_generation


BASE_PAYLOAD = {
    'assistant_message': 'ok',
    'summary': 'done',
    'architecture': 'split',
    'project_tree': ['frontend/'],
    'files': [],
    'warnings': [],
    'next_steps': [],
}


def test_normalize_generation_wraps_project_tree_string() -> None:
    payload = dict(BASE_PAYLOAD)
    payload['project_tree'] = 'frontend/'

    artifact = normalize_generation(payload)

    assert artifact.project_tree == ['frontend/']


def test_normalize_generation_converts_project_tree_dict() -> None:
    payload = dict(BASE_PAYLOAD)
    payload['project_tree'] = {
        'frontend/': 'React app',
        'backend/': 'FastAPI app',
    }

    artifact = normalize_generation(payload)

    assert artifact.project_tree == [
        'frontend/: React app',
        'backend/: FastAPI app',
    ]


def test_normalize_generation_wraps_warning_and_next_step_strings() -> None:
    payload = dict(BASE_PAYLOAD)
    payload['warnings'] = 'Use mocked prices only.'
    payload['next_steps'] = 'Add persistent storage.'

    artifact = normalize_generation(payload)

    assert artifact.warnings == ['Use mocked prices only.']
    assert artifact.next_steps == ['Add persistent storage.']


def test_normalize_generation_still_rejects_invalid_files_payload() -> None:
    payload = dict(BASE_PAYLOAD)
    payload['files'] = ['README.md']

    with pytest.raises(ValueError):
        normalize_generation(payload)


def test_normalize_generation_still_rejects_missing_summary() -> None:
    payload = dict(BASE_PAYLOAD)
    payload.pop('summary')

    with pytest.raises(ValueError):
        normalize_generation(payload)


def test_normalize_generation_still_rejects_missing_architecture() -> None:
    payload = dict(BASE_PAYLOAD)
    payload.pop('architecture')

    with pytest.raises(ValueError):
        normalize_generation(payload)