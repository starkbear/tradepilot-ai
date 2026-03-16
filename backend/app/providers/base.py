from typing import Protocol

from pydantic import BaseModel


class PromptBundle(BaseModel):
    system_prompt: str
    user_prompt: str
    workspace_path: str
    model: str


class Provider(Protocol):
    def generate(self, prompt_bundle: PromptBundle) -> dict: ...
