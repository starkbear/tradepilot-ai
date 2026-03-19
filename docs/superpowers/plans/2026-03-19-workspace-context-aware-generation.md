# Workspace Context Aware Generation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight workspace context builder so generation requests can inspect the current repository shape and key files before prompting the model.

**Architecture:** Keep the provider contract unchanged and add context awareness entirely in the backend generation path. A new `workspace_context` service will safely scan the workspace, select bounded excerpts from high-value files, and return a compact summary that the orchestrator injects into the existing prompt bundle.

**Tech Stack:** FastAPI, Pydantic, pathlib, pytest, httpx.

---

## File Structure Map

- Create: `backend/app/services/workspace_context.py`
  Owns directory scanning, ignore rules, key-file selection, excerpt truncation, and structured context assembly.
- Modify: `backend/app/services/orchestrator.py`
  Extends prompt construction to include workspace context and incremental generation guidance.
- Modify: `backend/app/api/routes/chat.py`
  Builds workspace context before calling the provider and passes it into the orchestrator.
- Create: `backend/tests/test_workspace_context.py`
  Covers ignore rules, key-file selection, excerpt truncation, and graceful handling of unreadable/non-text files.
- Modify: `backend/tests/test_orchestrator.py`
  Verifies the prompt now includes workspace summary and explicit incremental-generation guidance.
- Modify: `backend/tests/test_chat_generate_api.py`
  Verifies the API builds workspace context before provider invocation while preserving the response contract.

## Chunk 1: Workspace Context Builder

### Task 1: Add the new backend context service with focused unit tests

**Files:**
- Create: `backend/app/services/workspace_context.py`
- Create: `backend/tests/test_workspace_context.py`

- [ ] **Step 1: Write a failing test that ignored directories and log files are excluded from the directory snapshot**

Add a unit test that creates a temporary workspace containing `.git/`, `.worktrees/`, `node_modules/`, a `frontend-dev.log`, and normal source folders. Assert the resulting snapshot only contains the real project directories.

- [ ] **Step 2: Run the focused test to verify it fails for the expected missing-service reason**

Run: `python -m pytest backend/tests/test_workspace_context.py -q`
Expected: failure because `app.services.workspace_context` or the builder function does not exist yet.

- [ ] **Step 3: Write a second failing test for key-file selection and excerpt truncation**

Add a test that creates `README.md`, `package.json`, `backend/app/main.py`, `frontend/src/App.tsx`, and an oversized text file. Assert the context includes the high-value files, skips the oversized file, and truncates long excerpts to a fixed limit.

- [ ] **Step 4: Write a third failing test for non-decodable or unreadable files being skipped without crashing**

Add a binary file or invalid UTF-8 file and assert the context builder returns successfully without including that file in `key_files`.

- [ ] **Step 5: Implement the minimal context builder in `backend/app/services/workspace_context.py`**

Implement small, focused helpers such as:
- `build_workspace_context(workspace_path: str) -> dict`
- `_collect_directory_snapshot(root: Path) -> list[str]`
- `_select_key_files(root: Path) -> list[Path]`
- `_read_excerpt(path: Path) -> str | None`

Keep the first version heuristic-based and bounded:
- ignore `.git`, `.worktrees`, `node_modules`, cache dirs, temp dirs, and `*.log`
- cap the number of selected files
- cap excerpt size per file
- skip unreadable or binary content
- return a minimal summary even when little context is found

- [ ] **Step 6: Run the focused workspace-context suite and confirm green**

Run: `python -m pytest backend/tests/test_workspace_context.py -q`
Expected: all new workspace context tests pass.

- [ ] **Step 7: Commit the workspace context service and tests**

```bash
git add backend/app/services/workspace_context.py backend/tests/test_workspace_context.py
git commit -m "feat: add workspace context builder"
```

## Chunk 2: Prompt Enrichment for Incremental Generation

### Task 2: Inject workspace context into prompt construction with tight prompt-contract tests

**Files:**
- Modify: `backend/app/services/orchestrator.py`
- Modify: `backend/tests/test_orchestrator.py`

- [ ] **Step 1: Write a failing orchestrator test that a workspace summary is embedded in the prompt bundle**

Add a test that calls `build_prompt_bundle(...)` with a sample context object and asserts the resulting prompt includes a compact workspace summary and directory snapshot.

- [ ] **Step 2: Run the orchestrator test to verify it fails for the expected signature/content reason**

Run: `python -m pytest backend/tests/test_orchestrator.py -q`
Expected: failure because `build_prompt_bundle` does not yet accept workspace context or the prompt lacks the required content.

- [ ] **Step 3: Write a second failing orchestrator test for explicit incremental-generation guidance**

Assert the prompt includes instructions such as:
- the repository already exists
- prefer extending existing modules over recreating entrypoints
- align generated files with the detected stack and folder structure

- [ ] **Step 4: Implement the minimal orchestrator changes**

Update `build_prompt_bundle` so it accepts a `workspace_context: dict` argument and appends a compact, readable context block to `user_prompt` or the system prompt. Keep the provider-facing `PromptBundle` shape unchanged.

The context block should include at least:
- workspace summary
- directory snapshot
- selected key file paths with short reasons/excerpts
- explicit incremental guidance

- [ ] **Step 5: Run the orchestrator suite and confirm green**

Run: `python -m pytest backend/tests/test_orchestrator.py -q`
Expected: prompt-contract tests pass.

- [ ] **Step 6: Commit the orchestrator prompt enrichment**

```bash
git add backend/app/services/orchestrator.py backend/tests/test_orchestrator.py
git commit -m "feat: add workspace-aware prompt guidance"
```

## Chunk 3: API Integration and Regression Verification

### Task 3: Build workspace context during generation and verify the full backend contract stays stable

**Files:**
- Modify: `backend/app/api/routes/chat.py`
- Modify: `backend/tests/test_chat_generate_api.py`
- Verify: `backend/tests/test_openai_provider.py`
- Verify: `scripts/test.ps1`

- [ ] **Step 1: Write a failing API test that `/api/chat/generate` builds workspace context before provider invocation**

Update the existing API test to capture the prompt bundle passed into the fake provider. Assert the generated prompt contains workspace-summary content from a stubbed context builder.

- [ ] **Step 2: Run the API suite to verify it fails for the expected integration reason**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: failure because the route does not yet call the context builder or pass context into the orchestrator.

- [ ] **Step 3: Implement the minimal chat-route integration**

Update `backend/app/api/routes/chat.py` to:
- call `build_workspace_context(payload.workspace_path)`
- pass the resulting context into `build_prompt_bundle(...)`
- leave provider selection, normalization, and response shape unchanged

- [ ] **Step 4: Run the API suite and confirm green**

Run: `python -m pytest backend/tests/test_chat_generate_api.py -q`
Expected: API tests pass with the same response schema as before.

- [ ] **Step 5: Run targeted backend regression tests**

Run: `python -m pytest backend/tests/test_openai_provider.py backend/tests/test_workspace_context.py backend/tests/test_orchestrator.py backend/tests/test_chat_generate_api.py -q`
Expected: all focused backend tests pass.

- [ ] **Step 6: Run the full backend suite**

Run: `python -m pytest backend/tests -q`
Expected: full backend suite passes.

- [ ] **Step 7: Run the full project verification script**

Run: `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`
Expected: backend and frontend suites both pass.

- [ ] **Step 8: Perform one manual smoke check if environment allows**

Trigger one generate request against the local UI or API and confirm the request still succeeds with a valid response shape. If real model output is noisy, record the exact remaining failure rather than guessing.

- [ ] **Step 9: Commit the API integration and test updates**

```bash
git add backend/app/api/routes/chat.py backend/tests/test_chat_generate_api.py
# Include any remaining touched files from this chunk.
git commit -m "feat: use workspace context during generation"
```
