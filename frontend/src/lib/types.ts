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

export type CurrentArtifactPathTarget = {
  path: string
  kind: 'file' | 'change'
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

export type GenerationApplySummary = {
  validated_count: number
  applied_count: number
  applied_files_count: number
  applied_changes_count: number
  issue_count: number
  error_count: number
  last_applied_at: string
}

export type GenerationHistoryEntry = {
  id: string
  created_at: string
  goal: string
  summary: string
  artifact: GenerationArtifact
  apply_summary?: GenerationApplySummary | null
}

export type ApplyIssue = {
  path: string
  stage: 'validation' | 'apply'
  kind: string
  message: string
  suggestion: string
}

export type ApplyResult = {
  validated: string[]
  applied: string[]
  applied_files: string[]
  applied_changes: string[]
  skipped: string[]
  issues: ApplyIssue[]
  errors: string[]
}

export type ReadFileResult = {
  path: string
  content: string
}

export type PersistedSessionSnapshot = {
  display_name: string
  recent_workspaces: string[]
  preferred_provider: string
  screen: ScreenState
  workspace_path: string
  goal: string
  artifact: GenerationArtifact | null
  active_generation_id: string | null
  generation_history: GenerationHistoryEntry[]
  selected_file_paths: string[]
  selected_change_paths: string[]
  selected_file_path: string | null
  selected_change_path: string | null
  apply_result: ApplyResult | null
}
