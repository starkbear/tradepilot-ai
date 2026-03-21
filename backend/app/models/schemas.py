from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, model_validator


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


class FileChangeDraft(BaseModel):
    path: str
    mode: Literal['patch', 'rewrite']
    reason: str
    new_content: str
    selected: bool = True
    old_snippet: str | None = None
    replace_all_matches: bool = False

    @model_validator(mode='after')
    def validate_change_shape(self):
        if self.mode == 'patch' and not self.old_snippet:
            raise ValueError('patch changes require old_snippet')
        return self


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
    changes: list[FileChangeDraft] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class ApplyFilesRequest(BaseModel):
    workspace_path: str
    files: list[FileDraft] = Field(default_factory=list)
    changes: list[FileChangeDraft] = Field(default_factory=list)


class ApplyIssue(BaseModel):
    path: str
    stage: Literal['validation', 'apply']
    kind: str
    message: str
    suggestion: str


class ApplyResult(BaseModel):
    validated: list[str] = Field(default_factory=list)
    applied: list[str] = Field(default_factory=list)
    applied_files: list[str] = Field(default_factory=list)
    applied_changes: list[str] = Field(default_factory=list)
    skipped: list[str] = Field(default_factory=list)
    issues: list[ApplyIssue] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
