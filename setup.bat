@echo off
REM Aevum AI Setup Script for Windows

echo.
echo =========================================
echo   Aevum AI - Event Publicity Agent
echo   Setup Script for Windows
echo =========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo ✓ Python found
python --version

REM Create virtual environment
echo.
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database
echo.
echo Initializing database...
cd backend
python database.py
cd ..

REM Create .env if it doesn't exist
if not exist ".env" (
    echo.
    echo Creating .env file from template...
    copy .env.example .env
    echo ⚠  Please edit .env and add your API keys:
    echo    - GEMINI_API_KEY
    echo    - GOOGLE_CREDENTIALS_PATH
    echo    - GOOGLE_CALENDAR_ID
    echo    - SMTP credentials
)

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo Next steps:
echo   1. Edit .env with your API keys
echo   2. Run: python -m uvicorn main:app --reload --port 8000
echo      (from the backend folder)
echo   3. Visit: http://localhost:8000/docs
echo.
pause
