@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 start_website.py
) else (
  python start_website.py
)
if errorlevel 1 (
  echo Python is required to run the website locally.
  pause
)
