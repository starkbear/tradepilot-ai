from app.models.schemas import GenerationArtifact


LIST_FIELDS = ('warnings', 'next_steps')


def _coerce_string_list(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [value]
    return value



def _normalize_project_tree(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        return [f'{key}: {item}' for key, item in value.items()]
    return value



def normalize_generation(raw: dict) -> GenerationArtifact:
    payload = dict(raw)
    payload['project_tree'] = _normalize_project_tree(payload.get('project_tree'))

    for field in LIST_FIELDS:
        payload[field] = _coerce_string_list(payload.get(field))

    return GenerationArtifact.model_validate(payload)
