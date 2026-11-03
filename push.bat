@echo off
title Git Push - Shop Manager v2
echo ========================================
echo   Pushing Shop Manager v2 to GitHub
echo ========================================
echo.

cd /d C:\Users\HP\Documents\Audacity\shop-manager-v2

echo [1/6] Creating data backup...
if not exist backups mkdir backups
for /f "tokens=*" %%i in ('powershell -Command "Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'"') do set "ts=%%i"
if exist data\data.json (
    copy /Y data\data.json "backups\data_%ts%.json" >nul
    echo   [OK] data.json backed up
) else (
    echo   [!!] data.json not found
)
if exist data\analytics.json (
    copy /Y data\analytics.json "backups\analytics_%ts%.json" >nul
    echo   [OK] analytics.json backed up
) else (
    echo   [!!] analytics.json not found
)

echo.
echo [2/6] Checking status...
git status

echo.
echo [3/6] Adding all changes...
git add .

echo.
echo [4/6] Checking what was added...
git status

echo.
echo [5/6] Committing changes...
set /p commit_msg="Enter commit message: "
git commit -m "%commit_msg%"

echo.
echo [6/6] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Push complete!
echo ========================================
pause
