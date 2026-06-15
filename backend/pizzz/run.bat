@echo off
echo ===================================================
echo Starting PIZZZ SHOP Backend...
echo ===================================================

:: Set JAVA_HOME to JDK 21 to avoid Lombok incompatibility with Java 25
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo Using Java from: %JAVA_HOME%
echo.

call .\mvnw.cmd spring-boot:run
