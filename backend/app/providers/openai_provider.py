from app.core.config import require_openai_key
from app.providers.base import PromptBundle


class OpenAIProvider:
    def generate(self, prompt_bundle: PromptBundle) -> dict:
        require_openai_key()
        return {
            'assistant_message': f"OpenAI placeholder response for: {prompt_bundle.user_prompt}",
            'summary': 'OpenAI provider is connected but still using placeholder generation.',
            'architecture': 'Frontend + backend split.',
            'project_tree': ['frontend/', 'backend/'],
            'files': [],
            'warnings': ['Provider placeholder response in use.'],
            'next_steps': ['Implement real OpenAI API call.'],
        }
