@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Deploying with fixed Dockerfile...
call npx @railway/cli up --detach
echo.
echo Deployment started. Check logs at:
echo https://railway.com/project/abbc4b58-92c4-42ed-bbf5-7e3addfd1ad3
