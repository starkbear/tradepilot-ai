export type ScreenState = 'login' | 'workspace'

export type FileDraft = {
  path: string
  purpose: string
  content: string
  selected: boolean
}

export type FileChangeDraft = {
  path: string
  mode: 'patch' | 'rewrite'
  reason: string
  new_content: string
  selected: boolean
  old_snippet: string | null
  replace_all_matches: boolean
}

export type GenerationArtifact = {
  assistant_message?: string
  summary: string
  architecture: string
  project_tree: string[]
  files: FileDraft[]
  changes: FileChangeDraft[]
  warnings: string[]
  next_steps: string[]
}

export type ApplyResult = {
  applied: string[]
  applied_files: string[]
  applied_changes: string[]
  skipped: string[]
  errors: string[]
}
