@echo off
title SIM Medical Portal - backup to GitHub
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\backup-to-github.ps1" %*
echo.
pause
