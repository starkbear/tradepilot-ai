from pathlib import Path

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    display_name: str


class LocalUserSession(BaseModel):
    display_name: str
    recent_workspaces: list[str] = Field(default_factory=list)
    preferred_provider: str = 'openai'


class ProviderInfo(BaseModel):
    id: str
    label: str
    enabled: bool
    models: list[str]


class FileDraft(BaseModel):
    path: str
    purpose: str
    content: str
    selected: bool = True


class GenerationRequest(BaseModel):
    message: str
    workspace_path: str
    provider_id: str
    model: str


class GenerationArtifact(BaseModel):
    assistant_message: str
    summary: str
    architecture: str
    project_tree: list[str]
    files: list[FileDraft]
    warnings: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class ApplyFilesRequest(BaseModel):
    workspace_path: str
    files: list[FileDraft]


class ApplyResult(BaseModel):
    applied: list[str] = Field(default_factory=list)
    skipped: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
