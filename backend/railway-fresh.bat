@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Creating new service and deploying...
npx @railway/cli up --detach
echo.
echo Getting domain...
npx @railway/cli domain
