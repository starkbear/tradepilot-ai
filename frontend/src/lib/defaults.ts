import type { GenerationArtifact } from './types'

export const DEFAULT_PROVIDER_ID = 'openai'
export const DEFAULT_MODEL = 'gpt-4.1'

export const DEFAULT_ARTIFACT: GenerationArtifact = {
  assistant_message: 'Artifact preview placeholder',
  summary: 'No artifact generated yet.',
  architecture: 'Awaiting generation.',
  project_tree: [],
  files: [],
  warnings: [],
  next_steps: [],
}
