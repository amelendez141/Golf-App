@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Removing hardcoded PORT (let Railway assign it)...
call npx @railway/cli variables delete PORT
echo.
echo Redeploying...
call npx @railway/cli up --detach
