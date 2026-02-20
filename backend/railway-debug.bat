@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo === Railway Status ===
call npx @railway/cli status
echo.
echo === Environment Variables ===
call npx @railway/cli variables
echo.
echo === Recent Logs (last 50 lines) ===
call npx @railway/cli logs --num 50
