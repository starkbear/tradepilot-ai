# Workspace Context Aware Generation Design

## Goal

Improve generation quality by letting the backend inspect the current repository structure and a small set of high-value files before calling the model, so generated artifacts look like incremental additions to the existing project instead of a fresh scaffold.

## Scope

This slice adds repository context awareness to the backend generation path.

Included:
- directory snapshot collection for the selected workspace
- heuristic selection of key files
- bounded file excerpt capture
- structured workspace context assembly
- prompt enrichment that biases the model toward incremental generation

Not included:
- full repository indexing
- semantic code search
- automatic diffing of existing files
- long-term context caching
- frontend workflow changes

## Recommended Approach

Use a lightweight `workspace_context` service that builds a compact structured summary before generation. The generator should not stream the entire repository into the prompt. Instead, it should pass a compressed context package into the existing orchestrator.

This keeps responsibilities separated:
- filesystem scanning stays in a backend service
- prompt composition stays in the orchestrator
- provider logic stays focused on model requests and response validation

## Context Collection Rules

### Directory coverage

Always collect a shallow repository snapshot first so the model understands the current project shape.

Expected signal includes directories such as:
- `backend/`
- `frontend/`
- `docs/`
- `scripts/`
- nested app folders like `providers/`, `services/`, `components/`, `models/`

### Key file selection

Prefer a whitelist-driven heuristic instead of full-text ingestion.

High-priority files include:
- `README.md`
- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `backend/app/main.py`
- `frontend/src/App.tsx`
- representative files under `backend/app/services/`
- representative files under `backend/app/providers/`
- representative files under `frontend/src/components/`

### File reading limits

Read only a bounded excerpt from each selected file. The goal is structural understanding, not full code comprehension.

Recommended limits:
- skip large files outright
- skip binary files
- trim excerpts to a fixed character budget per file
- cap total selected file count

### Ignore rules

Always skip:
- `.git`
- `.worktrees`
- `node_modules`
- logs
- temp files
- binary assets
- cache folders

## Workspace Context Shape

The new service should produce a structured object with fields like:
- `workspace_summary`
- `directory_snapshot`
- `key_files`
- `generation_guidance`

`key_files` should include, per file:
- `path`
- `reason_selected`
- `content_excerpt`

Example intent of the final context:
- identify the project as a React + FastAPI local assistant
- show that `providers`, `services`, and `components` already exist
- tell the model to extend these structures instead of recreating them

## Generation Behavior Changes

With context present, generation should bias toward incremental changes:
- avoid recreating existing app entrypoints
- follow existing module boundaries when adding new files
- suggest additions that fit the current repository layout
- acknowledge existing architecture when proposing new artifacts

The output contract remains the same `GenerationArtifact` structure. The difference is that the artifact should now better match the current workspace.

## Backend Design

### New service

Add a new backend service module, tentatively `backend/app/services/workspace_context.py`.

Responsibilities:
- scan workspace safely
- filter ignored paths
- choose key files
- extract bounded content excerpts
- return structured context data

### Orchestrator changes

Extend the orchestrator so prompt building can include workspace context.

Prompt guidance should explicitly say:
- the repository already exists
- prefer incremental additions over rebuilding the scaffold
- align with the detected stack and directory structure

### Generation flow

Updated backend generation flow:
1. receive generation request
2. build workspace context from the requested workspace path
3. build prompt bundle with the context included
4. call the provider as before
5. normalize and validate the returned artifact as before

## Error Handling

This slice should stay resilient and conservative.

Rules:
- if the workspace path is unreadable, fall back with a clear backend error
- if a candidate file cannot be decoded, skip it instead of failing the whole request
- if the directory snapshot is large, trim it rather than overflowing the prompt
- if no useful context is found, continue generation with a minimal summary instead of crashing

## Testing Strategy

### Workspace context tests

Add unit tests for:
- ignored directories are skipped
- key files are selected from a realistic project tree
- excerpts are truncated to safe limits
- logs and large files are excluded

### Orchestrator tests

Add tests that verify:
- prompt output includes workspace summary
- prompt output includes incremental generation guidance
- provider contract remains unchanged

### Integration tests

Add or extend API/generation tests to verify:
- generation builds workspace context before provider invocation
- the same `PromptBundle` path is used end to end
- generation still returns the existing response schema

## Risks and Constraints

Primary risk is prompt bloat. The mitigation is strict selection and excerpt limits.

Secondary risk is accidental overreach where the assistant starts acting like a full repository refactoring tool. This should be avoided by keeping context read-only and using it only to bias generation, not to infer diffs.

## Expected Outcome

After this slice, asking the assistant to extend the current project should yield artifacts that look like:
- additions under existing `services` or `providers`
- components that fit the current frontend structure
- targeted files that complement the repository rather than duplicating it

That gives the project a much more realistic “continue from here” workflow without introducing a heavy indexing system.
