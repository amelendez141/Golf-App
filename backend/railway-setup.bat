@echo off
set PATH=C:\Program Files\nodejs;C:\Users\amele\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\amele\OneDrive\Desktop\Anthony Personal\Golf App\backend"
echo Setting environment variables...
npx @railway/cli variables set NODE_ENV=production
npx @railway/cli variables set PORT=3001
npx @railway/cli variables set JWT_SECRET=linkup-golf-super-secret-jwt-key-2024
npx @railway/cli variables set CORS_ORIGIN=https://frontend-dfx-e2ecc1c4.vercel.app
echo.
echo Opening Railway dashboard to add database...
npx @railway/cli open
