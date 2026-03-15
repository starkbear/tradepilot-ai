# Trading System Assistant Web MVP Design

**Date:** 2026-03-15
**Status:** Draft approved in conversation, pending file review

## Goal

Build a local web-based AI assistant that helps the user design and scaffold stock trading system projects. The MVP should let the user chat in a browser, preview structured outputs and generated files, then explicitly confirm before writing files into a selected workspace.

## Product Summary

This MVP is a local single-user tool with a lightweight login experience, a web chat interface, a multi-provider model architecture, and a controlled file generation workflow.

The first release focuses on moving from plain chat responses to actionable engineering artifacts:

- structured implementation plans
- project tree suggestions
- file drafts
- explicit confirmation before files are written

The MVP is not a complete stock trading platform. It is a project-building assistant for trading system development.

## User Decisions Confirmed

- Product type: local web chat application
- File generation mode: preview first, then confirm before writing
- Model architecture: provider-extensible, with OpenAI implemented first
- User model: local fake login / local session, not full multi-user auth

## Recommended Architecture

Use a lightweight front-end/back-end split:

- Frontend: local web UI for chat, previews, and file confirmation
- Backend: API service for sessions, prompt orchestration, provider abstraction, artifact generation, and workspace file writes

This approach keeps the MVP small while preserving clean boundaries for later growth. It avoids overloading the UI with model logic and avoids mixing file system writes directly into request formatting code.

## Core User Flow

1. User opens the local web app
2. User signs in through a simple fake login flow
3. User selects or enters a target workspace directory
4. User describes a trading-system-related goal in chat
5. Backend orchestrates the request and calls the selected provider
6. Backend returns structured artifacts:
   - assistant response
   - solution summary
   - architecture proposal
   - project tree
   - file drafts
   - warnings
   - next steps
7. User previews generated artifacts and selects which files should be written
8. User confirms file generation
9. Backend writes only approved files into the selected workspace
10. UI reports success, partial failures, and suggested next actions

## Frontend Modules

### 1. Auth Shell

Responsibility:

- provide a lightweight local login
- persist the active local user/session identity

Notes:

- no real auth provider
- local-only session behavior is sufficient for MVP

### 2. Workspace Panel

Responsibility:

- choose or enter a workspace path
- select provider/model
- display active configuration for the current generation

### 3. Chat Studio

Responsibility:

- render conversation history
- accept user prompts
- show assistant replies
- surface generation actions and state

### 4. Artifact Panel

Responsibility:

- show summary and architecture output
- render project tree
- list generated files
- preview file contents
- allow per-file selection before apply

## Backend Modules

### 1. session

Responsibility:

- manage fake login state
- persist active user/session preferences
- remember recent workspace and provider choices

### 2. chat

Responsibility:

- accept generation requests
- manage conversation state
- invoke orchestration for a request

### 3. orchestrator

Responsibility:

- encode the “trading system assistant” role and output constraints
- build structured prompts
- require schema-conforming responses

### 4. providers

Responsibility:

- define a shared provider interface
- implement OpenAI first
- leave clear extension points for Anthropic/Gemini later

### 5. artifacts

Responsibility:

- transform provider output into application-safe structured artifacts
- normalize file drafts, tree data, warnings, and next steps

### 6. workspace_fs

Responsibility:

- validate workspace path boundaries
- preview write operations
- write only approved files
- report per-file results

## Core Data Objects

### LocalUserSession

Stores:

- local identity
- recent workspaces
- provider preferences

### ChatSession

Stores:

- conversation history
- current workspace context
- current generation state

### GenerationRequest

Stores:

- user intent
- target workspace
- provider/model selection
- generation options

### GenerationArtifact

Stores:

- `assistant_message`
- `summary`
- `architecture`
- `project_tree`
- `files`
- `warnings`
- `next_steps`

### FileDraft

Stores:

- relative target path
- purpose/description
- generated content
- selected state for apply

### ApplyResult

Stores:

- success/failure by file
- skipped files
- error messages

## Suggested Technology Stack

### Frontend

- React
- Vite
- TypeScript

Reasoning:

- fast setup
- good local DX
- appropriate for chat plus artifact preview UI

### Backend

- FastAPI
- Pydantic

Reasoning:

- strong schema validation
- clear request/response contracts
- easy structured API design

### Persistence

For MVP:

- in-memory state plus JSON-backed local persistence where helpful

Not needed yet:

- relational database

### File and Runtime Utilities

- Python `pathlib`
- Python `json`
- small local config files

### Model Layer

- OpenAI first
- shared provider abstraction from day one

## API Design

### `POST /api/auth/login`

Purpose:

- create/update local fake login session

### `GET /api/session`

Purpose:

- return current local session and recent workspace/provider state

### `GET /api/providers`

Purpose:

- return supported providers and models available in the app

### `POST /api/chat/generate`

Purpose:

- accept the user request and return a structured `GenerationArtifact`

Expected response sections:

- `assistant_message`
- `summary`
- `architecture`
- `project_tree`
- `files`
- `warnings`
- `next_steps`

### `POST /api/files/apply`

Purpose:

- write only approved file drafts into the selected workspace

### `GET /api/health`

Purpose:

- simple startup and connectivity check

## Error Handling Requirements

The MVP should handle at least these failure modes:

- missing API key
- invalid API key
- provider/network timeout
- provider response that does not match expected schema
- invalid or missing target workspace
- attempts to write outside the selected workspace
- target file conflicts
- partial apply success

Recommended response shape:

- `success`
- `message`
- `data`
- `errors`

## Testing Strategy

The first version should establish trust around the most important behavior.

### Frontend

Test:

- basic rendering of chat and artifact views
- file selection behavior
- confirm-before-apply flow

### Backend

Test:

- request/response schema behavior
- orchestrator structured output expectations
- provider adapter boundaries
- workspace path safety
- apply only selected files

### Critical behavioral guarantees

These must be covered:

- preview happens before writes
- only user-approved files are written
- file writes cannot escape the selected workspace

## MVP Scope

Included:

- local web app
- fake login/local session
- workspace selection
- provider-extensible backend with OpenAI first
- trading-system-specific orchestration prompt
- structured generation output
- artifact preview
- selective file apply
- basic success and error reporting

## Explicit Non-Goals

Not in MVP:

- real multi-user auth
- database-backed persistence
- collaboration
- version history UI
- rich diff editor
- advanced multi-agent execution pipeline
- automatic code execution after generation
- full stock trading platform implementation

## Implementation Sequence

### Phase 1: Foundation

- scaffold frontend and backend
- implement fake login
- implement workspace selection
- add health endpoint
- build the basic chat layout

### Phase 2: Generation Loop

- integrate OpenAI through provider abstraction
- implement orchestrator
- return structured artifacts
- render result sections in UI

### Phase 3: File Apply Flow

- add file list and preview
- support per-file selection
- implement safe workspace writes
- display apply results

### Phase 4: Hardening and Extensibility

- strengthen error handling
- expand tests
- stabilize provider abstraction for future providers

## Success Criteria

The MVP is successful when a local user can:

- open a local web page
- sign in locally
- choose a workspace
- ask for a trading-system project scaffold
- receive a structured response with file drafts
- preview those files
- confirm which files to write
- write them safely into the workspace

## Risks and Guardrails

### Risk: Over-generating scope

Guardrail:

- keep the assistant focused on planning/scaffolding, not full autonomous implementation

### Risk: Unsafe file operations

Guardrail:

- validate every path relative to the chosen workspace before writing

### Risk: Provider-specific coupling

Guardrail:

- isolate provider logic behind a shared interface from the beginning

### Risk: UI complexity too early

Guardrail:

- prioritize one clean chat-plus-artifacts workflow over advanced editing features

## Next Step

After the user reviews this design file, create a detailed implementation plan and then execute it with a test-first workflow.
