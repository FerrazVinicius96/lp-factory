@echo off
REM Atalho: roda o setup sem precisar mexer na ExecutionPolicy do Windows.
REM Basta dar duplo clique neste arquivo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1" %*
pause
