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
