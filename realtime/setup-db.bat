@echo off
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE linkup_golf;"
echo Database setup attempted. If you see an error about password, you need to update the password in this script.
pause
