@echo off
rem Open the UI in Google Chrome (browser dev mode: Tauri APIs are mocked, no real audio capture).
cd /d "%~dp0"
start "translator web server" cmd /k npx --yes serve src -p 3111
rem Give the server a moment to start before opening Chrome.
timeout /t 3 /nobreak >nul
start chrome --app=http://localhost:3111
