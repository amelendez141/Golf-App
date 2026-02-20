@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Linking to project and service...
npx @railway/cli link --project abbc4b58-92c4-42ed-bbf5-7e3addfd1ad3 --service 38db2fb2-fc4c-4f69-916c-f89c36b1e53d
echo.
echo Checking status...
npx @railway/cli status
echo.
echo Getting logs...
npx @railway/cli logs --num 20
