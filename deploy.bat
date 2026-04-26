@echo off
REM ============================================================
REM Games.GG site deploy script
REM ------------------------------------------------------------
REM Bundles everything in this folder (except itself and a few
REM dev-only files) and pushes it to the live web root on the
REM server. Add new files/folders here and they auto-deploy.
REM ============================================================

setlocal
set REMOTE=max@gamesgg.net
set WEBROOT=/var/www/gamesgg.net

cd /d "%~dp0"

echo.
echo === Bundling site ===
tar -cf site.tar ^
  --exclude=site.tar ^
  --exclude=deploy.bat ^
  --exclude=.git ^
  --exclude=.gitignore ^
  --exclude=node_modules ^
  --exclude=.DS_Store ^
  --exclude=Thumbs.db ^
  . || goto :fail

echo.
echo === Uploading to server ===
scp site.tar %REMOTE%:/tmp/site.tar || goto :fail

echo.
echo === Extracting into web root ===
ssh %REMOTE% "sudo tar -xf /tmp/site.tar -C %WEBROOT% && sudo chown -R www-data:www-data %WEBROOT% && rm /tmp/site.tar" || goto :fail

del site.tar >nul 2>&1

echo.
echo ============================================================
echo Deploy complete:  https://gamesgg.net
echo ============================================================
echo.
pause
exit /b 0

:fail
echo.
echo ============================================================
echo Deploy FAILED. See errors above.
echo ============================================================
del site.tar >nul 2>&1
echo.
pause
exit /b 1
