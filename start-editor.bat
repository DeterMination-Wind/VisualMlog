@echo off
chcp 65001 >nul
setlocal

rem Clear any inherited env vars that webpack.config.js validates so a stale
rem user/system ROOT doesn't crash dev-server.
set "ROOT="
set "STATIC_PATH="

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

set "URL=http://localhost:8601/editor.html"

echo [start-editor] Starting webpack-dev-server in a new window...
start "MlogScratchTW dev-server" cmd /k "set ROOT=&& set STATIC_PATH=&& cd /d ""%SCRIPT_DIR%"" && npm start"

echo [start-editor] Waiting for %URL% ...
set /a TRIES=0
:wait
set /a TRIES+=1
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -TimeoutSec 2).StatusCode } catch { 0 }" > "%TEMP%\mlog_probe.txt"
set /p CODE=<"%TEMP%\mlog_probe.txt"
if "%CODE%"=="200" goto open
if %TRIES% GEQ 60 (
    echo [start-editor] Server did not respond after 60 attempts. Opening %URL% anyway.
    goto open
)
timeout /t 2 /nobreak >nul
goto wait

:open
echo [start-editor] Opening %URL% in default browser.
start "" "%URL%"
del "%TEMP%\mlog_probe.txt" >nul 2>&1
endlocal
exit /b 0
