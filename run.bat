@echo off
echo ========================================================
echo   Vitality AI - Human Energy ^& Productivity Platform
echo ========================================================
echo.

:: Start FastAPI backend
echo [1/2] Starting Backend (FastAPI) on http://localhost:8000 ...
start "Vitality AI Backend" powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\rohii\OneDrive\Desktop\Human Energy & Productivity Prediction'; uvicorn main:app --reload --port 8000"

:: Wait for backend to initialise
timeout /t 3 /nobreak >nul

:: Start React frontend dev server
echo [2/2] Starting Frontend (Vite) on http://localhost:5173 ...
start "Vitality AI Frontend" powershell -ExecutionPolicy Bypass -Command "Set-Location 'c:\Users\rohii\OneDrive\Desktop\Human Energy & Productivity Prediction'; node .\node_modules\vite\bin\vite.js"

echo.
echo Both servers are starting!
echo - Frontend:  http://localhost:5173
echo - Backend :  http://localhost:8000
echo - API Docs:  http://localhost:8000/docs
echo.
echo Create an account and log in to get started.
pause
