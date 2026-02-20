@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
npx @railway/cli service --help
echo.
echo Listing services in project...
npx @railway/cli whoami
