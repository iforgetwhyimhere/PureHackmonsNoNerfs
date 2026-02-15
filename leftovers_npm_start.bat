@echo off
setlocal enabledelayedexpansion
REM Start the leftovers-again bot (Windows)
REM Automatically creates a Python + Node.js virtual environment on first run.

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

set "VENV_DIR=!PROJECT_DIR!\venv\leftovers-again"
set "NODE_VERSION=16.20.0"

REM --- Create virtual environment if it doesn't exist ---
if not exist "!VENV_DIR!\Scripts\activate.bat" (
    echo ==========================================
    echo Creating virtual environment...
    echo ==========================================
    echo.

    python -m venv "!VENV_DIR!"
    call "!VENV_DIR!\Scripts\activate.bat"

    echo Installing nodeenv...
    pip install nodeenv

    echo.
    echo Installing Node.js v!NODE_VERSION! into venv (this may take a minute^)...
    nodeenv -p --node=!NODE_VERSION!

    echo.
    echo Virtual environment created successfully.
    echo.
) else (
    call "!VENV_DIR!\Scripts\activate.bat"
)

set "BOT_NICKNAME=!BOT_NICKNAME!"

echo ==========================================
echo Installing dependencies...
echo ==========================================
echo.

cd /d "!PROJECT_DIR!\leftovers-again"
call npm install

echo.
echo ==========================================
echo Starting leftovers-again bot...
echo ==========================================
echo.

call npm start -- --bot=src/bot.js

echo.
echo ==========================================
echo Bot process ended. Press any key to close.
echo ==========================================
pause
