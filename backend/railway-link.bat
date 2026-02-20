@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Linking to backend service...
npx @railway/cli service backend
echo.
echo Redeploying...
npx @railway/cli up --detach
