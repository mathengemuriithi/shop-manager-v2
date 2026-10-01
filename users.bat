@echo off
title Shop Manager v2 - User Manager
color 0B

:menu
cls
echo ========================================
echo   Shop Manager v2 - User Manager
echo ========================================
echo.
echo [1] Create Superuser
echo [2] List All Users
echo [3] Reset User Password
echo [4] Delete User
echo [5] Exit
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto create
if "%choice%"=="2" goto list
if "%choice%"=="3" goto reset
if "%choice%"=="4" goto delete
if "%choice%"=="5" exit
goto menu

:create
cls
echo === Create Superuser ===
set /p uname="Username: "
set /p upass="Password: "
cd /d "%~dp0"
node -e "const fs=require('fs');const p='./data/data.json';const d=JSON.parse(fs.readFileSync(p,'utf8'));if(d.users.find(u=>u.username==='%uname%')){console.log('User already exists');}else{d.users.push({id:d.users.length+1,username:'%uname%',password:'%upass%',role:'superadmin'});fs.writeFileSync(p,JSON.stringify(d,null,2));console.log('SUCCESS: User %uname% created with role superadmin');}"
echo.
pause
goto menu

:list
cls
echo === All Users ===
cd /d "%~dp0"
node -e "const d=require('./data/data.json');console.log('Total:',d.users.length);d.users.forEach(u=>console.log('- '+u.username+' ('+u.role+')'));"
echo.
pause
goto menu

:reset
cls
echo === Reset User Password ===
set /p uname="Username: "
set /p newpass="New Password: "
cd /d "%~dp0"
node -e "const fs=require('fs');const p='./data/data.json';const d=JSON.parse(fs.readFileSync(p,'utf8'));const u=d.users.find(x=>x.username==='%uname%');if(u){u.password='%newpass%';fs.writeFileSync(p,JSON.stringify(d,null,2));console.log('Password reset for %uname%');}else{console.log('User not found');}"
echo.
pause
goto menu

:delete
cls
echo === Delete User ===
set /p uname="Username to delete: "
cd /d "%~dp0"
node -e "const fs=require('fs');const p='./data/data.json';const d=JSON.parse(fs.readFileSync(p,'utf8'));const before=d.users.length;d.users=d.users.filter(u=>u.username!=='%uname%');if(d.users.length<before){fs.writeFileSync(p,JSON.stringify(d,null,2));console.log('User %uname% deleted');}else{console.log('User not found');}"
echo.
pause
goto menu
