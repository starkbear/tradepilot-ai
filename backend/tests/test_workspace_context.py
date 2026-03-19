from pathlib import Path

from app.services.workspace_context import build_workspace_context


def test_build_workspace_context_excludes_ignored_directories_and_logs(tmp_path: Path) -> None:
    (tmp_path / '.git').mkdir()
    (tmp_path / '.worktrees').mkdir()
    (tmp_path / 'node_modules').mkdir()
    (tmp_path / 'frontend').mkdir()
    (tmp_path / 'backend').mkdir()
    (tmp_path / 'docs').mkdir()
    (tmp_path / 'frontend-dev.log').write_text('ignore me', encoding='utf-8')

    context = build_workspace_context(str(tmp_path))

    assert context['directory_snapshot'] == ['backend/', 'docs/', 'frontend/']


def test_build_workspace_context_selects_key_files_and_truncates_excerpts(tmp_path: Path) -> None:
    (tmp_path / 'backend' / 'app').mkdir(parents=True)
    (tmp_path / 'frontend' / 'src').mkdir(parents=True)
    (tmp_path / 'README.md').write_text('# TradePilot AI\n' + ('A' * 800), encoding='utf-8')
    (tmp_path / 'package.json').write_text('{"name": "tradepilot-ai"}', encoding='utf-8')
    (tmp_path / 'backend' / 'app' / 'main.py').write_text('from fastapi import FastAPI\napp = FastAPI()\n', encoding='utf-8')
    (tmp_path / 'frontend' / 'src' / 'App.tsx').write_text('export function App() { return <div />; }', encoding='utf-8')
    (tmp_path / 'notes.txt').write_text('B' * 10000, encoding='utf-8')

    context = build_workspace_context(str(tmp_path))

    key_files = {item['path']: item for item in context['key_files']}
    assert 'README.md' in key_files
    assert 'package.json' in key_files
    assert 'backend/app/main.py' in key_files
    assert 'frontend/src/App.tsx' in key_files
    assert 'notes.txt' not in key_files
    assert len(key_files['README.md']['content_excerpt']) <= 400


def test_build_workspace_context_skips_non_text_files_without_crashing(tmp_path: Path) -> None:
    (tmp_path / 'backend').mkdir()
    (tmp_path / 'README.md').write_text('# Demo', encoding='utf-8')
    (tmp_path / 'backend' / 'app.bin').write_bytes(b'\x00\xff\x10\x81')

    context = build_workspace_context(str(tmp_path))

    key_file_paths = [item['path'] for item in context['key_files']]
    assert 'README.md' in key_file_paths
    assert 'backend/app.bin' not in key_file_paths
