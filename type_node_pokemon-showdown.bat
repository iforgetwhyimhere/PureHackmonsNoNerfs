@echo off
setlocal enabledelayedexpansion
REM Launch Pokemon Showdown server terminal (Windows)

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
echo Starting Pokemon Showdown server...
echo ==========================================
echo.

cd /d "!PROJECT_DIR!\pokemon-showdown"
node pokemon-showdown start

echo.
echo ==========================================
echo Server stopped. Press any key to close.
echo ==========================================
pause
