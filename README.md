# TradePilot AI

TradePilot AI is a local web-based assistant for planning and scaffolding stock trading system projects.

Instead of stopping at chat answers, it is designed to help turn an idea like "build me a trading system MVP" into structured engineering artifacts: architecture guidance, project structure suggestions, generated file drafts, and a controlled path toward writing approved files into a workspace.

## Why This Project Exists

Building a trading system usually starts with fragmented notes, disconnected prompts, and a lot of manual setup. TradePilot AI aims to make that first phase more reliable by combining:

- a focused trading-system assistant persona
- structured backend generation APIs
- a local web workflow for collecting requirements
- safe file-application logic that separates preview from write

## Current MVP Status

The repository currently includes a working MVP foundation:

- FastAPI backend with health, auth, provider, generation, and file-apply endpoints
- provider-extensible backend architecture with OpenAI-first wiring
- local React/Vite frontend shell with login, workspace, and generation form flow
- artifact preview components and baseline frontend tests
- safe workspace file application logic with path-boundary validation

What is not finished yet:

- real OpenAI response integration
- full artifact rendering and apply flow wired into the main frontend screen
- production-ready local persistence and multi-provider switching UI

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Vitest
- Testing Library

### Backend

- FastAPI
- Pydantic
- pytest

## Quick Start

### 1. Clone the repository

```powershell
git clone https://github.com/starkbear/tradepilot-ai.git
cd tradepilot-ai
```

### 2. Set your OpenAI API key

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
```

### 3. Install frontend dependencies

```powershell
Set-Location frontend
cmd /c npm install
Set-Location ..
```

### 4. Start the backend

```powershell
python -m uvicorn app.main:app --reload --app-dir backend
```

### 5. Start the frontend in another terminal

```powershell
Set-Location frontend
cmd /c npm run dev
```

## Running Tests

Run both backend and frontend tests with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
```

You can also run them separately.

### Backend

```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests -q
```

### Frontend

```powershell
Set-Location frontend
cmd /c npm run test -- --run
```

## Project Structure

```text
backend/
  app/
    api/routes/
    core/
    models/
    providers/
    services/
  tests/
frontend/
  src/
    components/
    lib/
    test/
docs/
  superpowers/
scripts/
```

## Roadmap

### Near Term

- connect the frontend artifact panel to live backend generation results
- implement real OpenAI provider calls
- support selective file apply from the UI
- improve README, setup ergonomics, and local developer workflow

### Later

- add more model providers
- persist local sessions and project history
- support richer artifact editing before apply
- evolve from scaffold assistant toward a full trading-system builder workflow

## Design Docs

Project design and implementation planning live here:

- `docs/superpowers/specs/2026-03-15-trading-system-assistant-web-design.md`
- `docs/superpowers/plans/2026-03-15-trading-system-assistant-web-mvp.md`

## Notes

This project is focused on system design and engineering workflow support. It is not investment advice and does not promise trading performance.
