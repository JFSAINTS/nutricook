# NutriCook Development Server Startup Script
# Starts both web server and API proxy

param(
    [string]$ApiKey = $env:CLAUDE_API_KEY
)

Write-Host "NutriCook Development Server" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check if API key is provided
if (-not $ApiKey) {
    Write-Host ""
    Write-Host "ERROR: CLAUDE_API_KEY not set" -ForegroundColor Red
    Write-Host "Set it with: `$env:CLAUDE_API_KEY='sk-...'" -ForegroundColor Yellow
    Write-Host "Or pass it: .\dev.ps1 -ApiKey 'sk-...'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan

# Kill any existing processes on ports 3456 and 3500
@(3456, 3500) | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

# Start web server (port 3456)
Write-Host "  1. Starting web server on port 3456..." -ForegroundColor Cyan
Start-Process -NoNewWindow python -ArgumentList "-m", "http.server", "3456"
Start-Sleep -Seconds 1

# Start API proxy (port 3500)
Write-Host "  2. Starting API proxy on port 3500..." -ForegroundColor Cyan
$env:CLAUDE_API_KEY = $ApiKey
Start-Process -NoNewWindow node -ArgumentList "api-proxy.js"
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "Servers running:" -ForegroundColor Green
Write-Host "  * Web:  http://localhost:3456" -ForegroundColor White
Write-Host "  * API:  http://localhost:3500" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 10
}
