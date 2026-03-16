@echo off
TITLE Campus3 Fullstack Launcher

:: Get the directory where the .bat file is located
SET ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo Starting FastAPI Backend...
:: Start the backend in a new window so you can see logs separately
start cmd /k "cd backend && uvicorn main:app --reload --port 8000"

echo Starting Vite Frontend...
:: Start the frontend in the current window (or another new one)
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are spinning up! 🚀
echo Close the individual command prompts to stop the servers.
pause