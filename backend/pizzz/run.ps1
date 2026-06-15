Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting PIZZZ SHOP Backend..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

# Set JAVA_HOME to JDK 21 to avoid Lombok incompatibility with Java 25
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Using Java from: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host ""

.\mvnw.cmd spring-boot:run
