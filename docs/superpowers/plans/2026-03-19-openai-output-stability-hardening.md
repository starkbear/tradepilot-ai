# OpenAI Output Stability Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce real OpenAI generation breakage from low-risk schema drift while preserving strict failure for malformed core artifact fields.

**Architecture:** Keep the existing `/api/chat/generate` contract and real OpenAI request path. Tighten the system prompt, expand provider-level tests for drift cases, and rely on a narrow normalization layer only for safe list-like fields.

**Tech Stack:** FastAPI backend, Pydantic, pytest, httpx.

---

## File Structure Map

- Modify: `backend/app/services/orchestrator.py`
  Strengthens the JSON contract and required field shape instructions.
- Modify: `backend/tests/test_openai_provider.py`
  Adds provider success/failure coverage for common low-risk drift and dangerous malformed payloads.
- Modify: `backend/tests/test_artifacts.py`
  Confirms normalization remains limited to the safe fields.
- Modify: `backend/app/services/artifacts.py`
  Only if tests prove the current safe normalization needs a small adjustment.
- Verify: `backend/tests/test_chat_generate_api.py`
  Ensures the API contract still maps provider failures the same way.

## Chunk 1: Drift Coverage First

### Task 1: Add failing provider and artifact tests before code changes

**Files:**
- Modify: `backend/tests/test_openai_provider.py`
- Modify: `backend/tests/test_artifacts.py`

- [ ] **Step 1: Add a failing provider test where `project_tree` is returned as a simple dict and should still succeed**

- [ ] **Step 2: Add a failing provider test where `warnings` and `next_steps` are returned as strings and should still succeed**

- [ ] **Step 3: Add a failing provider test where `files` is malformed and must still fail**

- [ ] **Step 4: Add an artifact test that missing `summary` or `architecture` still fails validation**

- [ ] **Step 5: Run `python -m pytest backend/tests/test_openai_provider.py backend/tests/test_artifacts.py -q` and confirm the new tests fail for the right reasons**

## Chunk 2: Prompt and Stability Hardening

### Task 2: Tighten prompt constraints and keep normalization narrow

**Files:**
- Modify: `backend/app/services/orchestrator.py`
- Modify: `backend/app/services/artifacts.py` (only if needed)
- Modify: `backend/tests/test_openai_provider.py`
- Modify: `backend/tests/test_artifacts.py`

- [ ] **Step 1: Expand the system prompt to explicitly require arrays for `project_tree`, `warnings`, and `next_steps`**

- [ ] **Step 2: Expand the system prompt to explicitly require `files` to be an array of objects with all required keys even when empty**

- [ ] **Step 3: Make the smallest implementation change needed if the new tests reveal a safe normalization gap**

- [ ] **Step 4: Run `python -m pytest backend/tests/test_openai_provider.py backend/tests/test_artifacts.py -q` and confirm green**

## Chunk 3: Regression Verification

### Task 3: Verify the existing backend contract remains stable

**Files:**
- Verify only unless failures force a change

- [ ] **Step 1: Run `python -m pytest backend/tests/test_chat_generate_api.py -q`**

- [ ] **Step 2: Run `python -m pytest backend/tests -q`**

- [ ] **Step 3: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**

- [ ] **Step 4: Manually trigger one browser generation request and confirm the page still renders when low-risk drift occurs, or surface the exact remaining failure if the upstream response is still invalid**
