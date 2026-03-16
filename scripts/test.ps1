$ErrorActionPreference = 'Stop'
$env:PYTHONPATH = 'backend'
python -m pytest backend/tests -q
Set-Location 'frontend'
cmd /c npm run test -- --run
