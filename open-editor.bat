@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

set "PORT=8601"
set "URL=http://127.0.0.1:%PORT%/editor.html"

netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul
if errorlevel 1 (
    start "" /min cmd /c "npm start"
)

set /a ATTEMPTS=0
:wait_port
netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul
if not errorlevel 1 goto open_page
set /a ATTEMPTS+=1
if !ATTEMPTS! geq 60 goto open_page
timeout /t 1 /nobreak >nul
goto wait_port

:open_page
start "" "%URL%"

endlocal
