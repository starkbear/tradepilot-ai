$ErrorActionPreference = 'Stop'
Write-Host 'Start the backend and frontend in separate terminals:'
Write-Host '1. python -m uvicorn app.main:app --reload --app-dir backend'
Write-Host '2. cmd /c npm --prefix frontend run dev'
