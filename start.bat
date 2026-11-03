@echo off
setlocal enabledelayedexpansion
title Shop Manager v2 - Development Server
color 0A

REM ═══════════════════════════════════════════════════════════════════
REM   Shop Manager v2 - Auto Start Script
REM   Location: shop-manager-v2\start.bat
REM   Purpose:  Launch dev server with automatic checks
REM ═══════════════════════════════════════════════════════════════════

REM ─── CONFIGURATION ─────────────────────────────────────────────────
set "PROJECT_DIR=%~dp0"
set "PORT=3000"
set "URL=http://localhost:%PORT%"

REM ─── HEADER ────────────────────────────────────────────────────────
cls
echo.
echo  ================================================================
echo    SHOP MANAGER v2
echo    E-commerce Management System
echo  ================================================================
echo.

REM ─── CHANGE TO PROJECT DIRECTORY ───────────────────────────────────
cd /d "%PROJECT_DIR%"

REM ─── CHECK: Are we in the right place? ─────────────────────────────
if not exist "package.json" (
    color 0C
    echo  [X] ERROR: package.json not found!
    echo.
    echo      Current directory: %CD%
    echo      This script must be placed in the shop-manager-v2 folder.
    echo.
    pause
    exit /b 1
)
echo  [OK] Project folder verified
echo       Path: %CD%

REM ─── CHECK: Is Node.js installed? ──────────────────────────────────
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo  [X] ERROR: Node.js is not installed!
    echo.
    echo      Download it from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM ─── SHOW: Node & npm versions ─────────────────────────────────────
for /f "tokens=*" %%i in ('node -v') do set "NODE_VERSION=%%i"
for /f "tokens=*" %%i in ('npm -v') do set "NPM_VERSION=%%i"
echo  [OK] Node.js %NODE_VERSION%
echo  [OK] npm %NPM_VERSION%

REM ─── CHECK: Are dependencies installed? ────────────────────────────
if not exist "node_modules" (
    echo.
    echo  [!] Dependencies not installed.
    echo      Running npm install... (this may take a minute)
    echo.
    call npm install
    if !errorlevel! neq 0 (
        color 0C
        echo.
        echo  [X] npm install failed. Check the errors above.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed
) else (
    echo  [OK] Dependencies present
)

REM ─── CHECK: Is data folder present? ────────────────────────────────
if not exist "data" (
    echo  [!] data folder missing — creating...
    mkdir data
    echo  [OK] data folder created
) else (
    echo  [OK] data folder present
)

REM ─── CHECK: Is uploads folder present? ─────────────────────────────
if not exist "public\uploads" (
    echo  [!] uploads folder missing — creating...
    mkdir "public\uploads"
    echo  [OK] uploads folder created
) else (
    echo  [OK] uploads folder present
)

REM ─── CHECK: Is port already in use? ────────────────────────────────
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    color 0E
    echo.
    echo  [!] WARNING: Port %PORT% is already in use!
    echo      Another server might be running.
    echo.
    choice /C YN /M "     Kill the existing process and continue"
    if !errorlevel! equ 1 (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>nul
        )
        echo  [OK] Freed port %PORT%
    ) else (
        echo      Exiting...
        pause
        exit /b 1
    )
)
color 0A

REM ─── STARTING BANNER ───────────────────────────────────────────────
echo.
echo  ================================================================
echo    STARTING SERVER
echo  ================================================================
echo.
echo    URL:   %URL%
echo    Admin: %URL%/admin
echo    Shop:  %URL%/shop
echo.
echo    Press Ctrl+C to stop the server
echo  ================================================================
echo.

REM ─── RUN THE SERVER ────────────────────────────────────────────────
call npm start

REM ─── SERVER STOPPED ────────────────────────────────────────────────
echo.
echo  ================================================================
echo    SERVER STOPPED
echo  ================================================================
echo.
echo    If this was unexpected, check the errors above.
echo.
pause
endlocal
