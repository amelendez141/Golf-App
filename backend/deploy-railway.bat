@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Logging into Railway...
call npx @railway/cli login
echo.
echo Initializing Railway project...
call npx @railway/cli init
echo.
echo Deploying to Railway...
call npx @railway/cli up --detach
