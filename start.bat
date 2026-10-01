@echo off
title Shop Manager v2 - Development Server
color 0A

echo ========================================
echo   Starting Shop Manager v2
echo ========================================
echo.

cd /d "C:\Users\HP\Documents\Audacity\shop-manager-v2"

echo Checking dependencies...
if not exist "node_modules" (
    echo [!] node_modules not found. Running npm install...
    call npm install
    echo.
)

echo Starting server...
echo.
call npm start

echo.
echo ========================================
echo   Server stopped. Press any key to exit.
echo ========================================
pause >nul
