$env:PGPASSWORD = "postgres"
& "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres linkup_golf
Write-Host "Database created successfully!"
