# Trading System Assistant Web MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local web app that chats with the user about trading-system scaffolding, returns structured artifacts, and only writes approved files into the selected workspace.

**Architecture:** Create a split React/Vite frontend and FastAPI backend. Keep provider access, orchestration, artifact shaping, and workspace file writes in separate backend modules. Keep the frontend focused on local login, workspace selection, chat, artifact preview, and explicit file apply confirmation.

**Tech Stack:** React, Vite, TypeScript, Vitest, Testing Library, FastAPI, Pydantic, pytest, Python pathlib/json, OpenAI-first provider abstraction.

---

## File Structure Map

### Top-level

- Create: `.gitignore`
- Create: `README.md`
- Create: `scripts/dev.ps1`
- Create: `scripts/test.ps1`

### Backend

- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/models/schemas.py`
- Create: `backend/app/providers/base.py`
- Create: `backend/app/providers/factory.py`
- Create: `backend/app/providers/openai_provider.py`
- Create: `backend/app/services/session_store.py`
- Create: `backend/app/services/orchestrator.py`
- Create: `backend/app/services/artifacts.py`
- Create: `backend/app/services/workspace_fs.py`
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/routes/__init__.py`
- Create: `backend/app/api/routes/auth.py`
- Create: `backend/app/api/routes/providers.py`
- Create: `backend/app/api/routes/chat.py`
- Create: `backend/app/api/routes/files.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_health.py`
- Create: `backend/tests/test_auth_api.py`
- Create: `backend/tests/test_providers_api.py`
- Create: `backend/tests/test_chat_generate_api.py`
- Create: `backend/tests/test_workspace_fs.py`
- Create: `backend/tests/test_files_apply_api.py`

### Frontend

- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/defaults.ts`
- Create: `frontend/src/components/LoginShell.tsx`
- Create: `frontend/src/components/WorkspacePanel.tsx`
- Create: `frontend/src/components/ChatStudio.tsx`
- Create: `frontend/src/components/ArtifactPanel.tsx`
- Create: `frontend/src/components/FilePreview.tsx`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/src/App.test.tsx`
- Create: `frontend/src/components/ArtifactPanel.test.tsx`

### Responsibility Notes

- `backend/app/main.py`: assemble FastAPI app and mount routes
- `backend/app/models/schemas.py`: shared request/response types
- `backend/app/providers/*`: provider interface and OpenAI implementation
- `backend/app/services/orchestrator.py`: system prompt and structured response contract
- `backend/app/services/artifacts.py`: normalize raw provider output to UI-safe artifacts
- `backend/app/services/workspace_fs.py`: path validation and file application
- `frontend/src/App.tsx`: top-level state and screen coordination only
- `frontend/src/components/*`: focused UI sections with minimal cross-component logic
- `frontend/src/lib/api.ts`: HTTP client helpers only

## Implementation Notes

- Use `cmd /c npm ...` for Node commands from PowerShell on this machine because direct `npm` invokes a blocked `.ps1` shim.
- Run backend tests from the repo root with `python -m pytest ...`.
- Keep the OpenAI provider behind a shared provider interface and use a fake provider in tests.
- Do not wire file writes directly to chat responses; all writes must go through `workspace_fs` after explicit approval.

## Chunk 1: Foundation

### Task 1: Bootstrap the repository and prove the minimum app shells

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `scripts/dev.ps1`
- Create: `scripts/test.ps1`
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_health.py`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing backend health test**

```python
from fastapi.testclient import TestClient
from app.main import app


def test_health_endpoint_returns_ok() -> None:
    client = TestClient(app)

    response = client.get('/api/health')

    assert response.status_code == 200
    assert response.json() == {
        'success': True,
        'message': 'ok',
        'data': {'status': 'ok'},
        'errors': [],
    }
```

- [ ] **Step 2: Run the backend test to verify it fails for the expected reason**

Run: `python -m pytest backend/tests/test_health.py -q`
Expected: FAIL with `ModuleNotFoundError` or missing route assertion because the backend app is not built yet.

- [ ] **Step 3: Write the minimal backend app and route**

```python
from fastapi import FastAPI

app = FastAPI()


@app.get('/api/health')
def health() -> dict:
    return {
        'success': True,
        'message': 'ok',
        'data': {'status': 'ok'},
        'errors': [],
    }
```

- [ ] **Step 4: Run the backend test to verify it passes**

Run: `python -m pytest backend/tests/test_health.py -q`
Expected: PASS

- [ ] **Step 5: Write the failing frontend shell test**

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

it('renders the local login entry point', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /trading system assistant/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /enter workspace/i })).toBeInTheDocument()
})
```

- [ ] **Step 6: Run the frontend test to verify it fails**

Run: `cmd /c npm --prefix frontend run test -- --run src/App.test.tsx`
Expected: FAIL because the frontend scaffold and test runner do not exist yet.

- [ ] **Step 7: Create the minimal frontend shell to make the test pass**

```tsx
export default function App() {
  return (
    <main>
      <h1>Trading System Assistant</h1>
      <button type="button">Enter Workspace</button>
    </main>
  )
}
```

- [ ] **Step 8: Run the frontend test to verify it passes**

Run: `cmd /c npm --prefix frontend run test -- --run src/App.test.tsx`
Expected: PASS

- [ ] **Step 9: Add baseline repo hygiene files**

```gitignore
.superpowers/
frontend/node_modules/
frontend/dist/
backend/.pytest_cache/
backend/.venv/
__pycache__/
*.pyc
.env
```

```powershell
# scripts/test.ps1
$ErrorActionPreference = 'Stop'
python -m pytest backend/tests -q
cmd /c npm --prefix frontend run test -- --run
```

- [ ] **Step 10: Commit**

```bash
git add .gitignore README.md scripts backend frontend
git commit -m "chore: scaffold web assistant foundation"
```

## Chunk 2: Backend Session and Provider Contracts

### Task 2: Add local session and provider listing APIs

**Files:**
- Create: `backend/app/core/config.py`
- Create: `backend/app/models/schemas.py`
- Create: `backend/app/services/session_store.py`
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/routes/__init__.py`
- Create: `backend/app/api/routes/auth.py`
- Create: `backend/app/api/routes/providers.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_auth_api.py`
- Create: `backend/tests/test_providers_api.py`

- [ ] **Step 1: Write the failing auth API test**

```python
from fastapi.testclient import TestClient
from app.main import app


def test_login_persists_local_session() -> None:
    client = TestClient(app)

    response = client.post('/api/auth/login', json={'display_name': 'Wei'})

    assert response.status_code == 200
    payload = response.json()['data']
    assert payload['display_name'] == 'Wei'
    assert payload['recent_workspaces'] == []
```

- [ ] **Step 2: Run the auth test to verify it fails**

Run: `python -m pytest backend/tests/test_auth_api.py -q`
Expected: FAIL with 404 or missing schema because the auth route does not exist.

- [ ] **Step 3: Implement the minimal local session model and auth route**

```python
class LoginRequest(BaseModel):
    display_name: str


class LocalUserSession(BaseModel):
    display_name: str
    recent_workspaces: list[str] = []
    preferred_provider: str = 'openai'


class SessionStore:
    def __init__(self) -> None:
        self._session = LocalUserSession(display_name='Guest')

    def login(self, display_name: str) -> LocalUserSession:
        self._session = LocalUserSession(display_name=display_name)
        return self._session
```

- [ ] **Step 4: Run the auth test to verify it passes**

Run: `python -m pytest backend/tests/test_auth_api.py -q`
Expected: PASS

- [ ] **Step 5: Write the failing providers API test**

```python
from fastapi.testclient import TestClient
from app.main import app


def test_providers_endpoint_returns_openai_first() -> None:
    client = TestClient(app)

    response = client.get('/api/providers')

    assert response.status_code == 200
    providers = response.json()['data']['providers']
    assert providers[0]['id'] == 'openai'
    assert providers[0]['enabled'] is True
```

- [ ] **Step 6: Run the providers test to verify it fails**

Run: `python -m pytest backend/tests/test_providers_api.py -q`
Expected: FAIL with 404 because the route is missing.

- [ ] **Step 7: Implement configuration and providers listing route**

```python
class ProviderInfo(BaseModel):
    id: str
    label: str
    enabled: bool
    models: list[str]


def get_provider_catalog() -> list[ProviderInfo]:
    return [
        ProviderInfo(
            id='openai',
            label='OpenAI',
            enabled=True,
            models=['gpt-4.1', 'gpt-4o-mini'],
        )
    ]
```

- [ ] **Step 8: Run the session and provider tests together**

Run: `python -m pytest backend/tests/test_auth_api.py backend/tests/test_providers_api.py -q`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add backend
git commit -m "feat: add local session and provider catalog APIs"
```

## Chunk 3: Structured Generation Backend

### Task 3: Build provider abstraction and structured generation endpoint

**Files:**
- Create: `backend/app/providers/base.py`
- Create: `backend/app/providers/factory.py`
- Create: `backend/app/providers/openai_provider.py`
- Create: `backend/app/services/orchestrator.py`
- Create: `backend/app/services/artifacts.py`
- Create: `backend/app/api/routes/chat.py`
- Modify: `backend/app/models/schemas.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_chat_generate_api.py`

- [ ] **Step 1: Write the failing structured generation test**

```python
from fastapi.testclient import TestClient
from app.main import app


def test_generate_returns_structured_artifacts(monkeypatch) -> None:
    from app.providers.factory import get_provider

    class FakeProvider:
        def generate(self, prompt_bundle):
            return {
                'assistant_message': 'Here is your scaffold.',
                'summary': 'MVP scaffold ready.',
                'architecture': 'Frontend + backend split.',
                'project_tree': ['frontend/', 'backend/'],
                'files': [
                    {
                        'path': 'README.md',
                        'purpose': 'project overview',
                        'content': '# Demo',
                        'selected': True,
                    }
                ],
                'warnings': [],
                'next_steps': ['Review generated files'],
            }

    monkeypatch.setattr('app.providers.factory.get_provider', lambda *_: FakeProvider())
    client = TestClient(app)

    response = client.post(
        '/api/chat/generate',
        json={
            'message': 'Build a stock trading system MVP',
            'workspace_path': 'D:/Codex/Trading assistant',
            'provider_id': 'openai',
            'model': 'gpt-4.1',
        },
    )

    assert response.status_code == 200
    data = response.json()['data']
    assert data['summary'] == 'MVP scaffold ready.'
    assert data['files'][0]['path'] == 'README.md'
```

- [ ] **Step 2: Run the generation test to verify it fails**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: FAIL because the route, schema, or provider abstraction does not exist yet.

- [ ] **Step 3: Implement provider protocol, prompt orchestration, and artifact normalization**

```python
class Provider(Protocol):
    def generate(self, prompt_bundle: 'PromptBundle') -> dict: ...


class PromptBundle(BaseModel):
    system_prompt: str
    user_prompt: str
    workspace_path: str
    model: str


def build_prompt_bundle(message: str, workspace_path: str, model: str) -> PromptBundle:
    return PromptBundle(
        system_prompt='You are a trading system assistant. Return structured JSON only.',
        user_prompt=message,
        workspace_path=workspace_path,
        model=model,
    )
```

```python
def normalize_generation(raw: dict) -> GenerationArtifact:
    return GenerationArtifact.model_validate(raw)
```

- [ ] **Step 4: Run the generation test to verify it passes**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: PASS

- [ ] **Step 5: Add a backend guard test for invalid provider IDs**

```python
def test_generate_rejects_unknown_provider() -> None:
    client = TestClient(app)

    response = client.post(
        '/api/chat/generate',
        json={
            'message': 'Build a stock trading system MVP',
            'workspace_path': 'D:/Codex/Trading assistant',
            'provider_id': 'unknown',
            'model': 'x',
        },
    )

    assert response.status_code == 400
```

- [ ] **Step 6: Implement the minimal error branch and rerun the tests**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: PASS with both the happy path and unknown-provider case covered.

- [ ] **Step 7: Commit**

```bash
git add backend
git commit -m "feat: add structured generation backend"
```

### Task 4: Implement safe file application logic

**Files:**
- Create: `backend/app/services/workspace_fs.py`
- Create: `backend/app/api/routes/files.py`
- Modify: `backend/app/main.py`
- Modify: `backend/app/models/schemas.py`
- Create: `backend/tests/test_workspace_fs.py`
- Create: `backend/tests/test_files_apply_api.py`

- [ ] **Step 1: Write the failing workspace safety tests**

```python
from pathlib import Path
from app.services.workspace_fs import validate_relative_path


def test_validate_relative_path_rejects_escape() -> None:
    workspace = Path('D:/Codex/Trading assistant')

    try:
        validate_relative_path(workspace, '../outside.txt')
    except ValueError as exc:
        assert 'outside the workspace' in str(exc)
    else:
        raise AssertionError('expected ValueError')
```

```python
from fastapi.testclient import TestClient
from app.main import app


def test_apply_writes_only_selected_files(tmp_path) -> None:
    client = TestClient(app)

    response = client.post(
        '/api/files/apply',
        json={
            'workspace_path': str(tmp_path),
            'files': [
                {'path': 'keep.txt', 'purpose': 'keep', 'content': 'A', 'selected': True},
                {'path': 'skip.txt', 'purpose': 'skip', 'content': 'B', 'selected': False},
            ],
        },
    )

    assert response.status_code == 200
    assert (tmp_path / 'keep.txt').read_text() == 'A'
    assert not (tmp_path / 'skip.txt').exists()
```

- [ ] **Step 2: Run the file safety tests to verify they fail**

Run: `python -m pytest backend/tests/test_workspace_fs.py backend/tests/test_files_apply_api.py -q`
Expected: FAIL because the workspace service and route are missing.

- [ ] **Step 3: Implement minimal path validation and apply behavior**

```python
from pathlib import Path


def validate_relative_path(workspace: Path, relative_path: str) -> Path:
    resolved = (workspace / relative_path).resolve()
    if workspace.resolve() not in resolved.parents and resolved != workspace.resolve():
        raise ValueError('Target path is outside the workspace')
    return resolved
```

```python
def apply_files(workspace_path: str, files: list[FileDraft]) -> ApplyResult:
    workspace = Path(workspace_path)
    applied = []
    skipped = []
    for file in files:
        if not file.selected:
            skipped.append(file.path)
            continue
        target = validate_relative_path(workspace, file.path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(file.content, encoding='utf-8')
        applied.append(file.path)
    return ApplyResult(applied=applied, skipped=skipped, errors=[])
```

- [ ] **Step 4: Run the file safety tests to verify they pass**

Run: `python -m pytest backend/tests/test_workspace_fs.py backend/tests/test_files_apply_api.py -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat: add safe file apply flow"
```

## Chunk 4: Frontend Experience

### Task 5: Build local login, workspace selection, and chat shell

**Files:**
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/defaults.ts`
- Create: `frontend/src/components/LoginShell.tsx`
- Create: `frontend/src/components/WorkspacePanel.tsx`
- Create: `frontend/src/components/ChatStudio.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/styles.css`
- Modify: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write the failing UI flow test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

it('lets the user log in locally and see the workspace form', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText(/display name/i), 'Wei')
  await user.click(screen.getByRole('button', { name: /enter workspace/i }))

  expect(screen.getByLabelText(/workspace path/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /generate scaffold/i })).toBeDisabled()
})
```

- [ ] **Step 2: Run the UI test to verify it fails**

Run: `cmd /c npm --prefix frontend run test -- --run src/App.test.tsx`
Expected: FAIL because the login/workspace flow is not implemented.

- [ ] **Step 3: Implement the minimal screen flow and local state**

```tsx
type ScreenState = 'login' | 'workspace'

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('login')
  const [displayName, setDisplayName] = useState('')

  return screen === 'login' ? (
    <LoginShell
      displayName={displayName}
      onDisplayNameChange={setDisplayName}
      onContinue={() => setScreen('workspace')}
    />
  ) : (
    <WorkspacePanel workspacePath="" canGenerate={false} />
  )
}
```

- [ ] **Step 4: Run the UI test to verify it passes**

Run: `cmd /c npm --prefix frontend run test -- --run src/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add login and workspace shell"
```

### Task 6: Render artifacts and support apply confirmation in the UI

**Files:**
- Create: `frontend/src/components/ArtifactPanel.tsx`
- Create: `frontend/src/components/FilePreview.tsx`
- Modify: `frontend/src/components/ChatStudio.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/components/ArtifactPanel.test.tsx`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Write the failing artifact panel test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArtifactPanel } from './ArtifactPanel'

it('lets the user preview files and deselect one before apply', async () => {
  const user = userEvent.setup()
  render(
    <ArtifactPanel
      artifact={{
        summary: 'ready',
        architecture: 'split app',
        project_tree: ['frontend/', 'backend/'],
        files: [
          { path: 'README.md', purpose: 'docs', content: '# Demo', selected: true },
          { path: 'notes.txt', purpose: 'notes', content: 'skip', selected: true },
        ],
        warnings: [],
        next_steps: [],
      }}
      onToggleFile={() => {}}
      onApply={() => {}}
    />,
  )

  expect(screen.getByText('README.md')).toBeInTheDocument()
  await user.click(screen.getByLabelText(/notes.txt/i))
  expect(screen.getByRole('button', { name: /apply selected files/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the artifact panel test to verify it fails**

Run: `cmd /c npm --prefix frontend run test -- --run src/components/ArtifactPanel.test.tsx`
Expected: FAIL because the artifact components and typed props do not exist.

- [ ] **Step 3: Implement the minimal artifact rendering and toggle behavior**

```tsx
export function ArtifactPanel({ artifact, onToggleFile, onApply }: Props) {
  return (
    <section>
      <h2>Generated Plan</h2>
      <p>{artifact.summary}</p>
      <ul>
        {artifact.files.map((file) => (
          <li key={file.path}>
            <label>
              <input
                type="checkbox"
                checked={file.selected}
                onChange={() => onToggleFile(file.path)}
                aria-label={file.path}
              />
              {file.path}
            </label>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onApply}>Apply selected files</button>
    </section>
  )
}
```

- [ ] **Step 4: Run the artifact panel test to verify it passes**

Run: `cmd /c npm --prefix frontend run test -- --run src/components/ArtifactPanel.test.tsx`
Expected: PASS

- [ ] **Step 5: Wire `App.tsx` to the backend generation/apply APIs using a mocked happy path first**

```tsx
const artifact = await api.generate({
  message,
  workspacePath,
  providerId,
  model,
})
setArtifact(artifact)
```

- [ ] **Step 6: Run the full frontend test suite**

Run: `cmd /c npm --prefix frontend run test -- --run`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add frontend
git commit -m "feat: add artifact preview and apply UI"
```

## Chunk 5: Integration and Hardening

### Task 7: Connect the frontend to the backend and verify the end-to-end happy path

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `backend/app/providers/openai_provider.py`
- Modify: `backend/app/providers/factory.py`
- Modify: `backend/app/core/config.py`
- Modify: `README.md`
- Modify: `scripts/dev.ps1`
- Modify: `scripts/test.ps1`
- Test: `backend/tests/test_chat_generate_api.py`
- Test: `backend/tests/test_files_apply_api.py`
- Test: `frontend/src/App.test.tsx`
- Test: `frontend/src/components/ArtifactPanel.test.tsx`

- [ ] **Step 1: Add a failing backend test for missing OpenAI credentials**

```python
def test_generate_returns_503_when_openai_key_missing(monkeypatch) -> None:
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    client = TestClient(app)

    response = client.post(
        '/api/chat/generate',
        json={
            'message': 'Build a stock trading system MVP',
            'workspace_path': 'D:/Codex/Trading assistant',
            'provider_id': 'openai',
            'model': 'gpt-4.1',
        },
    )

    assert response.status_code == 503
```

- [ ] **Step 2: Run the backend integration-focused tests to verify the failure**

Run: `python -m pytest backend/tests/test_chat_generate_api.py backend/tests/test_files_apply_api.py -q`
Expected: FAIL because missing-key handling is not implemented yet.

- [ ] **Step 3: Implement OpenAI config checks and human-readable error responses**

```python
def require_openai_key() -> str:
    api_key = os.getenv('OPENAI_API_KEY', '').strip()
    if not api_key:
        raise ProviderConfigurationError('OPENAI_API_KEY is required for the OpenAI provider')
    return api_key
```

- [ ] **Step 4: Run the backend tests to verify they pass**

Run: `python -m pytest backend/tests/test_health.py backend/tests/test_auth_api.py backend/tests/test_providers_api.py backend/tests/test_chat_generate_api.py backend/tests/test_workspace_fs.py backend/tests/test_files_apply_api.py -q`
Expected: PASS

- [ ] **Step 5: Add a frontend integration-oriented test for showing backend error feedback**

```tsx
it('shows a readable error when generation fails', async () => {
  server.use(
    http.post('/api/chat/generate', () => HttpResponse.json({
      success: false,
      message: 'OPENAI_API_KEY is required for the OpenAI provider',
      data: null,
      errors: ['missing key'],
    }, { status: 503 })),
  )

  render(<App />)
  // drive the form to submit
  expect(await screen.findByText(/openai_api_key is required/i)).toBeInTheDocument()
})
```

- [ ] **Step 6: Run the full frontend tests to verify they pass**

Run: `cmd /c npm --prefix frontend run test -- --run`
Expected: PASS

- [ ] **Step 7: Document the local setup and run commands**

```md
1. Set `OPENAI_API_KEY`
2. Run `python -m uvicorn app.main:app --reload --app-dir backend`
3. Run `cmd /c npm --prefix frontend run dev`
```

- [ ] **Step 8: Run the combined verification scripts**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend suites both pass without warnings that indicate broken test setup.

- [ ] **Step 9: Commit**

```bash
git add README.md scripts backend frontend
git commit -m "feat: connect generation flow end to end"
```

## Execution Notes

- Implement this plan with a strict TDD loop: write one failing test, confirm the failure, write the minimum code, rerun the targeted test, then move on.
- Prefer small commits exactly as outlined above.
- If package scaffolding commands generate extra files, keep only the ones needed for this plan and update the matching task file lists before committing.
- If subagents are unavailable in the harness, execute this plan in the current session using the `executing-plans` workflow.
