from __future__ import annotations

from pathlib import Path

IGNORED_DIR_NAMES = {
    '.git',
    '.worktrees',
    'node_modules',
    '__pycache__',
    '.pytest_cache',
    '.tmp',
    '.tmp-shared',
    '.superpowers',
}
IGNORED_SUFFIXES = {'.log', '.pyc', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg'}
HIGH_PRIORITY_FILES = {
    'README.md': 'Project overview and setup context.',
    'package.json': 'Frontend/runtime dependency summary.',
    'pyproject.toml': 'Python project metadata and dependencies.',
    'requirements.txt': 'Python dependency list.',
    'backend/app/main.py': 'Primary backend application entrypoint.',
    'frontend/src/App.tsx': 'Primary frontend application shell.',
}
REPRESENTATIVE_PATTERNS = (
    ('backend/app/services', 'Existing backend service module.'),
    ('backend/app/providers', 'Existing provider integration module.'),
    ('frontend/src/components', 'Existing frontend UI component.'),
)
MAX_DIRECTORY_ENTRIES = 12
MAX_KEY_FILES = 8
MAX_FILE_SIZE_BYTES = 4096
MAX_EXCERPT_CHARS = 400


def build_workspace_context(workspace_path: str) -> dict:
    root = Path(workspace_path)
    if not root.exists() or not root.is_dir():
        raise ValueError(f'Workspace path is not readable: {workspace_path}')

    directory_snapshot = _collect_directory_snapshot(root)
    selected_files = _select_key_files(root)
    key_files: list[dict] = []
    for path, reason in selected_files:
        excerpt = _read_excerpt(path)
        if excerpt is None:
            continue
        key_files.append(
            {
                'path': _relative_path(root, path),
                'reason_selected': reason,
                'content_excerpt': excerpt,
            }
        )

    workspace_summary = _build_workspace_summary(root, directory_snapshot, key_files)
    return {
        'workspace_summary': workspace_summary,
        'directory_snapshot': directory_snapshot,
        'key_files': key_files,
        'generation_guidance': [
            'The repository already exists.',
            'Prefer extending existing modules over recreating entrypoints.',
            'Align generated files with the detected stack and folder structure.',
        ],
    }


def _collect_directory_snapshot(root: Path) -> list[str]:
    directories: list[str] = []
    for path in sorted(root.iterdir(), key=lambda item: item.name.lower()):
        if not path.is_dir() or _should_ignore(path):
            continue
        directories.append(f'{path.name}/')
        if len(directories) >= MAX_DIRECTORY_ENTRIES:
            break
    return directories


def _select_key_files(root: Path) -> list[tuple[Path, str]]:
    selected: list[tuple[Path, str]] = []
    seen: set[Path] = set()

    for relative_path, reason in HIGH_PRIORITY_FILES.items():
        path = root / relative_path
        if path.is_file() and _is_candidate_file(path):
            selected.append((path, reason))
            seen.add(path)

    for relative_dir, reason in REPRESENTATIVE_PATTERNS:
        directory = root / relative_dir
        if not directory.is_dir():
            continue
        for path in sorted(directory.rglob('*'), key=lambda item: str(item).lower()):
            if not path.is_file() or path in seen or not _is_candidate_file(path):
                continue
            selected.append((path, reason))
            seen.add(path)
            break
        if len(selected) >= MAX_KEY_FILES:
            return selected[:MAX_KEY_FILES]

    return selected[:MAX_KEY_FILES]


def _read_excerpt(path: Path) -> str | None:
    if path.stat().st_size > MAX_FILE_SIZE_BYTES:
        return None
    try:
        content = path.read_text(encoding='utf-8')
    except (OSError, UnicodeDecodeError):
        return None
    excerpt = content[:MAX_EXCERPT_CHARS]
    return excerpt.strip() if excerpt.strip() else excerpt


def _build_workspace_summary(root: Path, directory_snapshot: list[str], key_files: list[dict]) -> str:
    stack_bits: list[str] = []
    if (root / 'frontend' / 'src' / 'App.tsx').is_file() or (root / 'package.json').is_file():
        stack_bits.append('React frontend')
    if (root / 'backend' / 'app' / 'main.py').is_file():
        stack_bits.append('FastAPI backend')

    if stack_bits:
        stack_summary = ' + '.join(stack_bits)
    elif directory_snapshot:
        stack_summary = 'existing multi-folder project'
    else:
        stack_summary = 'existing workspace'

    return f'{stack_summary} with {len(key_files)} key file excerpts and directories: {", ".join(directory_snapshot) or "none"}.'


def _is_candidate_file(path: Path) -> bool:
    if _should_ignore(path):
        return False
    return path.is_file()


def _should_ignore(path: Path) -> bool:
    if any(part in IGNORED_DIR_NAMES for part in path.parts):
        return True
    if path.suffix.lower() in IGNORED_SUFFIXES:
        return True
    return False


def _relative_path(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()
