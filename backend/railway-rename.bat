@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Current status...
npx @railway/cli status
echo.
echo Your backend API is deployed at:
echo https://fabulous-vitality-production-a112.up.railway.app
echo.
echo Testing health endpoint...
curl -s https://fabulous-vitality-production-a112.up.railway.app/health
