@echo off
REM Bulk SMS Application Setup Script for Windows

echo.
echo 🚀 Bulk SMS Application Setup
echo ==============================
echo.

if not exist .env (
    echo 📋 Creating .env file from .env.example...
    copy .env.example .env
    echo ✅ .env file created. Please update it with your SMS provider credentials.
    echo.
    pause
)

echo 📦 Installing dependencies...

REM Install root dependencies
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd server
call npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
call npm install
cd ..

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your SMS provider credentials
echo 2. Run 'docker-compose up -d' to start services
echo    OR
echo 3. Run 'npm run dev' to start both frontend and backend
echo.
pause
