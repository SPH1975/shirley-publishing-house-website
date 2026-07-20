@echo off
setlocal
cd /d "%~dp0"

if not exist "index.html" (
  echo ERROR: index.html was not found.
  echo Please extract the complete ZIP file before running this launcher.
  pause
  exit /b 1
)

echo Opening Shirley Publishing House website...
start "" "%~dp0index.html"
exit /b 0
