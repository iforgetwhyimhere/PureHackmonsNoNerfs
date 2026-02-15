@echo off
setlocal enabledelayedexpansion
REM Launch Pokemon Showdown Cloudflare tunnel (Windows)

REM Load environment variables from .env file
if not exist "%~dp0leftovers-again\.env" (
    echo Error: leftovers-again\.env not found.
    echo Copy leftovers-again\.env.example to leftovers-again\.env and fill in your values.
    pause
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%a in ("%~dp0leftovers-again\.env") do (
    set "line=%%a"
    if not "!line:~0,1!"=="#" if not "%%a"=="" set "%%a=%%b"
)

echo ==========================================
echo Starting Cloudflare Tunnel...
echo ==========================================
echo.

cd /d "!PROJECT_DIR!\pokemon-showdown"
cloudflared tunnel --url http://localhost:8000

echo.
echo ==========================================
echo Tunnel stopped. Press any key to close.
echo ==========================================
pause
