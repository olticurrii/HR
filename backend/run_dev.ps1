# Windows PowerShell script to run the development server
Write-Host "🚀 Starting HR Management Backend Development Server" -ForegroundColor Green

# Change to backend directory
Set-Location $PSScriptRoot

# Run setup
Write-Host "📦 Setting up virtual environment..." -ForegroundColor Yellow
python scripts/setup_venv.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup virtual environment" -ForegroundColor Red
    exit 1
}

# Check dependencies
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow
python scripts/check_deps.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependencies check failed" -ForegroundColor Red
    exit 1
}

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
python scripts/dev_server.py

