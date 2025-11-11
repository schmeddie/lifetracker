@echo off
echo ================================
echo LifeTracker Windows Setup Script
echo ================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
echo.

REM Check if PostgreSQL is accessible
echo [2/6] Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] psql command not found in PATH
    echo This is OK if you're using pgAdmin to create the database
    echo Make sure PostgreSQL is installed and the database 'lifetracker' exists!
) else (
    echo [OK] PostgreSQL is accessible
)
echo.

REM Install root dependencies
echo [3/6] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)
echo.

REM Install client dependencies
echo [4/6] Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)
cd ..
echo.

REM Install server dependencies
echo [5/6] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
echo.

REM Check if .env exists
echo [6/6] Checking configuration...
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ============================================
    echo IMPORTANT: You need to edit server\.env file
    echo ============================================
    echo.
    echo 1. Open server\.env in Notepad
    echo 2. Replace YOUR_PASSWORD_HERE with your PostgreSQL password
    echo 3. Save the file
    echo.
    echo Opening .env file now...
    timeout /t 2 >nul
    notepad .env
    echo.
    echo After editing .env, run: setup-database.bat
    echo.
) else (
    echo [OK] .env file already exists
    echo.
    echo Next step: Run setup-database.bat to create database tables
)

cd ..

echo.
echo ================================
echo Setup dependencies complete!
echo ================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running
echo 2. Create database 'lifetracker' using pgAdmin or psql
echo 3. Edit server\.env with your database password
echo 4. Run: setup-database.bat
echo.
pause
