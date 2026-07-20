@echo off
setlocal
cd /d "%~dp0"

echo Checking for Python...
where py >nul 2>nul
if %errorlevel%==0 (
  echo Starting at http://localhost:8000/index.html
  start "" http://localhost:8000/index.html
  py -m http.server 8000
  goto :end
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting at http://localhost:8000/index.html
  start "" http://localhost:8000/index.html
  python -m http.server 8000
  goto :end
)

echo.
echo Python is not installed or is not available in PATH.
echo Use START_WEBSITE.bat instead. It does not require Python.
pause

:end
endlocal
