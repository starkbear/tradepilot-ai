# OpenAI Output Normalization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve real OpenAI generation stability by normalizing a few near-miss output shapes before final schema validation.

**Architecture:** Keep `OpenAIProvider` unchanged and add the behavior in `artifacts.py`, where all generation payloads already pass before becoming a `GenerationArtifact`. Tests should prove that only a small set of safe conversions are allowed.

**Tech Stack:** FastAPI backend, Pydantic, pytest.

---

## Chunk 1: Artifact Normalization Behavior

### Task 1: Add failing normalization tests first

**Files:**
- Modify: `backend/tests/test_openai_provider.py`
- Create: `backend/tests/test_artifacts.py`

- [ ] **Step 1: Write a failing test for string `project_tree` normalization**

- [ ] **Step 2: Write a failing test for dict `project_tree` normalization**

- [ ] **Step 3: Write a failing test for string `warnings` and `next_steps` normalization**

- [ ] **Step 4: Write a guard test proving invalid `files` payloads still fail**

- [ ] **Step 5: Run `python -m pytest backend/tests/test_artifacts.py -q` and confirm the new tests fail for the right reason**

## Chunk 2: Minimal Backend Implementation

### Task 2: Normalize only the safe list-like fields

**Files:**
- Modify: `backend/app/services/artifacts.py`
- Create: `backend/tests/test_artifacts.py`

- [ ] **Step 1: Add a small helper that normalizes list-like fields**

- [ ] **Step 2: Convert `project_tree` strings into single-item lists**

- [ ] **Step 3: Convert `project_tree` dicts into readable list entries**

- [ ] **Step 4: Convert `warnings` and `next_steps` strings into lists**

- [ ] **Step 5: Keep `files` untouched so invalid file payloads still fail**

- [ ] **Step 6: Run `python -m pytest backend/tests/test_artifacts.py -q` and confirm green**

## Chunk 3: Regression Verification

### Task 3: Re-run the existing provider and project test paths

**Files:**
- Verify only

- [ ] **Step 1: Run `python -m pytest backend/tests/test_openai_provider.py -q`**

- [ ] **Step 2: Run `python -m pytest backend/tests -q`**

- [ ] **Step 3: Run `powershell -ExecutionPolicy Bypass -File scripts/test.ps1`**

- [ ] **Step 4: Manually trigger one browser generation request and confirm the page renders instead of failing on the first schema mismatch**
