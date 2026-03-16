from app.providers.openai_provider import OpenAIProvider


class ProviderFactoryError(ValueError):
    pass


def get_provider(provider_id: str):
    if provider_id == 'openai':
        return OpenAIProvider()
    raise ProviderFactoryError(f'Unknown provider: {provider_id}')
