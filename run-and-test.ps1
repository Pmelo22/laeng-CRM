# Start the dev server in background
Write-Host "Iniciando servidor..." -ForegroundColor Cyan
$devProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru -WorkingDirectory "c:\Users\pm221\Desktop\Projetos\laeng-CRM"
Write-Host "Servidor iniciado com PID: $($devProcess.Id)" -ForegroundColor Green

# Wait for server to be ready
Write-Host "Aguardando servidor estar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test login
Write-Host "`nTestando login..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -Body "{`"login`":`"admin`",`"senha`":`"admin123`"}" -ContentType "application/json" -TimeoutSec 5
    Write-Host "Login bem-sucedido!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
}
catch {
    Write-Host "Erro no login:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Stop server
Write-Host "`nParando servidor..." -ForegroundColor Yellow
$devProcess | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Servidor parado" -ForegroundColor Green
