@echo off
title LabFix - Smart Computer Lab Management System
echo ========================================================
echo   Starting LabFix - Smart Computer Lab Management System
echo ========================================================
echo.
py app.py
if errorlevel 1 (
    python app.py
)
pause
