# ========================================================
# GeoSentinel Local Multi-Service Stopper
# Stops uvicorn, java geosentinel backend, and vite node processes
# ========================================================

Write-Host "Stopping GeoSentinel Local Services..." -ForegroundColor Yellow

# Kill Uvicorn Python process
Get-Process | Where-Object { $_.CommandLine -like "*uvicorn app.main:app*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill Java backend process
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*geosentinel-backend*" -or $_.CommandLine -like "*org.springframework.boot*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill Vite dev server (Node on port 5173 or cmdline)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*vite*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "GeoSentinel services stopped." -ForegroundColor Green
