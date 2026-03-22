import type {
  ApplyResult,
  FileChangeDraft,
  FileDraft,
  GenerationArtifact,
  PersistedSessionSnapshot,
  ReadFileResult,
} from './types'

type LoginRequest = {
  displayName: string
}

type GenerateRequest = {
  message: string
  workspacePath: string
  providerId: string
  model: string
}

type ApplyFilesRequest = {
  workspacePath: string
  files: FileDraft[]
  changes: FileChangeDraft[]
}

type ReadFileRequest = {
  workspacePath: string
  path: string
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors: string[]
}

export async function generateArtifact(request: GenerateRequest): Promise<GenerationArtifact> {
  const response = await fetch('/api/chat/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: request.message,
      workspace_path: request.workspacePath,
      provider_id: request.providerId,
      model: request.model,
    }),
  })

  const payload = (await response.json()) as ApiEnvelope<GenerationArtifact | null>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || 'Generation failed')
  }

  return payload.data
}

export async function loadSession(): Promise<PersistedSessionSnapshot> {
  const response = await fetch('/api/session')
  const payload = (await response.json()) as ApiEnvelope<PersistedSessionSnapshot | null>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || 'Loading session failed')
  }

  return payload.data
}

export async function clearSession(): Promise<PersistedSessionSnapshot> {
  const response = await fetch('/api/session', {
    method: 'DELETE',
  })
  const payload = (await response.json()) as ApiEnvelope<PersistedSessionSnapshot | null>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || 'Clearing session failed')
  }

  return payload.data
}

export async function loginLocalSession(request: LoginRequest): Promise<PersistedSessionSnapshot> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      display_name: request.displayName,
    }),
  })

  const payload = (await response.json()) as ApiEnvelope<PersistedSessionSnapshot | null>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || 'Login failed')
  }

  return payload.data
}

export async function applyFiles(request: ApplyFilesRequest): Promise<ApplyResult> {
  const response = await fetch('/api/files/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspace_path: request.workspacePath,
      files: request.files,
      changes: request.changes,
    }),
  })

  const payload = (await response.json()) as ApiEnvelope<ApplyResult | null>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || 'Applying files failed')
  }

  return payload.data
}

export async function readWorkspaceFile(request: ReadFileRequest): Promise<ReadFileResult> {
  const response = await fetch('/api/files/read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspace_path: request.workspacePath,
      path: request.path,
    }),
  })

  const payload = (await response.json()) as ApiEnvelope<ReadFileResult | null>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || 'Reading file failed')
  }

  return payload.data
}
