import json

import httpx

from app.core.config import require_openai_key
from app.services.artifacts import normalize_generation
from app.providers.base import PromptBundle


class OpenAIProvider:
    def generate(self, prompt_bundle: PromptBundle) -> dict:
        api_key = require_openai_key()

        try:
            response = httpx.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                },
                json={
                    'model': prompt_bundle.model,
                    'temperature': 0.2,
                    'messages': [
                        {'role': 'system', 'content': prompt_bundle.system_prompt},
                        {'role': 'user', 'content': prompt_bundle.user_prompt},
                    ],
                },
                timeout=30.0,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise ValueError(f'OpenAI request failed with status {exc.response.status_code}') from exc
        except httpx.RequestError as exc:
            raise ValueError('OpenAI request failed before a response was received') from exc

        payload = response.json()
        try:
            content = payload['choices'][0]['message']['content']
        except (KeyError, IndexError, TypeError) as exc:
            raise ValueError('OpenAI response did not include message content') from exc

        if not isinstance(content, str) or not content.strip():
            raise ValueError('OpenAI response did not include message content')

        try:
            raw = json.loads(content)
        except json.JSONDecodeError as exc:
            raise ValueError('OpenAI returned invalid JSON for generation output') from exc

        artifact = normalize_generation(raw)
        return artifact.model_dump()
