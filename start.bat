@echo off
rem Start My Translator in dev mode (needs Node.js 18+ and Rust). First run compiles Rust, takes a few minutes.
cd /d "%~dp0"
if not exist node_modules (
    call npm install || goto :fail
)
call npm run dev || goto :fail
exit /b 0

:fail
echo.
echo Start failed. See the error above.
pause
exit /b 1
