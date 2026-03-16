from app.models.schemas import GenerationArtifact


def normalize_generation(raw: dict) -> GenerationArtifact:
    return GenerationArtifact.model_validate(raw)
