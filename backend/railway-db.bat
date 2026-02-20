@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Setting DATABASE_URL...
call npx @railway/cli variables set "DATABASE_URL=postgresql://neondb_owner:npg_F2ExyoZcS8nf@ep-rough-shadow-aiwi8u9h-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
echo.
echo Redeploying with database...
call npx @railway/cli up --detach
