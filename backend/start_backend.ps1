# Start backend server
cd $PSScriptRoot
.\venv\Scripts\Activate.ps1
Write-Host "Starting backend server..." -ForegroundColor Green
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

