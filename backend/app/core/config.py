from app.models.schemas import ProviderInfo


def get_provider_catalog() -> list[ProviderInfo]:
    return [
        ProviderInfo(
            id='openai',
            label='OpenAI',
            enabled=True,
            models=['gpt-4.1', 'gpt-4o-mini'],
        )
    ]
