@echo off
echo ===================================
echo LifeTracker Database Setup
echo ===================================
echo.

REM Check if we're in the right directory
if not exist "server\prisma\schema.prisma" (
    echo [ERROR] Please run this script from the lifetracker root directory
    pause
    exit /b 1
)

echo [1/2] Running database migrations...
cd server
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo.
    echo [ERROR] Database migration failed!
    echo.
    echo Common issues:
    echo 1. Database 'lifetracker' doesn't exist - create it in pgAdmin
    echo 2. Wrong password in server\.env file
    echo 3. PostgreSQL is not running
    echo.
    pause
    exit /b 1
)
echo.

echo [2/2] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)

cd ..

echo.
echo ===================================
echo Database setup complete!
echo ===================================
echo.
echo You can now start the application with: npm run dev
echo Or use: start-app.bat
echo.
pause
