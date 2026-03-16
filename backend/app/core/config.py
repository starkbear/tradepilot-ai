import os


class ProviderConfigurationError(ValueError):
    pass


def get_provider_catalog():
    from app.models.schemas import ProviderInfo

    return [
        ProviderInfo(
            id='openai',
            label='OpenAI',
            enabled=True,
            models=['gpt-4.1', 'gpt-4o-mini'],
        )
    ]


def require_openai_key() -> str:
    api_key = os.getenv('OPENAI_API_KEY', '').strip()
    if not api_key:
        raise ProviderConfigurationError('OPENAI_API_KEY is required for the OpenAI provider')
    return api_key
