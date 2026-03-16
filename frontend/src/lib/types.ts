export type ScreenState = 'login' | 'workspace'

export type FileDraft = {
  path: string
  purpose: string
  content: string
  selected: boolean
}

export type GenerationArtifact = {
  assistant_message?: string
  summary: string
  architecture: string
  project_tree: string[]
  files: FileDraft[]
  warnings: string[]
  next_steps: string[]
}
