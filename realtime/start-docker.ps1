$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path
Set-Location $PSScriptRoot
docker compose up -d
