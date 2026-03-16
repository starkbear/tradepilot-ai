import type { GenerationArtifact } from './types'

type GenerateRequest = {
  message: string
  workspacePath: string
  providerId: string
  model: string
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
