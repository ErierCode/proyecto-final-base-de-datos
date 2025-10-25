@echo off
echo 🚀 Mini DataGrip - Instalación para Windows
echo ==========================================
echo.

echo 📋 Verificando herramientas necesarias...
echo.

REM Verificar si chocolatey está instalado
where choco >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Chocolatey no está instalado
    echo 💡 Instalando Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    echo ✅ Chocolatey instalado
) else (
    echo ✅ Chocolatey ya está instalado
)

echo.
echo 🐘 Instalando PostgreSQL...
choco install postgresql -y
echo ✅ PostgreSQL instalado

echo.
echo 🍃 Instalando MongoDB...
choco install mongodb -y
echo ✅ MongoDB instalado

echo.
echo 🔧 Configurando servicios...
net start postgresql
net start MongoDB
echo ✅ Servicios iniciados

echo.
echo 📝 Creando base de datos de prueba...
echo Creando usuario y base de datos en PostgreSQL...

REM Crear script SQL temporal
echo CREATE USER root2 WITH PASSWORD 'hola'; > temp_setup.sql
echo CREATE DATABASE prueba5 OWNER root2; >> temp_setup.sql
echo GRANT ALL PRIVILEGES ON DATABASE prueba5 TO root2; >> temp_setup.sql

REM Ejecutar script SQL
psql -U postgres -f temp_setup.sql
del temp_setup.sql

echo ✅ Base de datos PostgreSQL configurada

echo.
echo 📊 Verificando instalación...
node scripts/quick-setup.js

echo.
echo 🎉 ¡Instalación completada!
echo 🚀 Ejecuta: npm run dev
echo 🌐 Abre: http://localhost:3000
echo.
pause
