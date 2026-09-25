# ========================================================
# GeoSentinel Local Multi-Service Development Launcher
# Starts (100% Native Windows - Zero Docker):
#   1. Python FastAPI AI Service (port 8000)
#   2. Spring Boot 3 Backend API (port 8080)
#   3. React Vite Web Console (port 5173)
# ========================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   GeoSentinel AI Event Intelligence & Impact Engine " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$AiServicePath = Join-Path $Root "ai-service"
$BackendPath = Join-Path $Root "backend"
$FrontendPath = Join-Path $Root "frontend"

# 1. AI Service
Write-Host "`n[1/3] Starting Python AI Microservice on http://localhost:8000..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $AiServicePath

Start-Sleep -Seconds 2

# 2. Spring Boot Backend
Write-Host "`n[2/3] Starting Spring Boot Backend API on http://localhost:8080..." -ForegroundColor Green
$BackendJar = Join-Path $BackendPath "target\geosentinel-backend-1.0.0.jar"
if (Test-Path $BackendJar) {
    Start-Process -FilePath "java" -ArgumentList "-jar target\geosentinel-backend-1.0.0.jar" -WorkingDirectory $BackendPath
} else {
    Start-Process -FilePath "powershell" -ArgumentList "-Command `".\mvnw.cmd spring-boot:run`"" -WorkingDirectory $BackendPath
}

Start-Sleep -Seconds 3

# 3. React Frontend
Write-Host "`n[3/3] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $FrontendPath

Write-Host "`nAll 3 GeoSentinel Services Launched Successfully!" -ForegroundColor Cyan
Write-Host "  Frontend Console : http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend REST API : http://localhost:8080/api/v1" -ForegroundColor Yellow
Write-Host "  Swagger UI Docs  : http://localhost:8080/swagger-ui.html" -ForegroundColor Yellow
Write-Host "  AI Microservice  : http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  AI Health Check  : http://localhost:8000/api/v1/health" -ForegroundColor Yellow
