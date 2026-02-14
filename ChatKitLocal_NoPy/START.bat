@echo off
setlocal

cd /d "%~dp0"

REM --- check Node ---
node --version >nul 2>&1
if errorlevel 1 (
  echo Node.js non trovato. Installa Node 18+ e riprova.
  pause
  exit /b 1
)

REM --- install backend deps ---
if not exist "backend\node_modules" (
  echo Installo dipendenze backend...
  pushd backend
  npm install
  popd
)

REM --- install frontend deps ---
if not exist "frontend\node_modules" (
  echo Installo dipendenze frontend...
  pushd frontend
  npm install
  popd
)

REM --- start backend ---
echo Avvio backend su http://127.0.0.1:8787 ...
start "ChatKitLocal BACKEND" cmd /k "cd /d %cd%\backend && npm run dev"

REM --- start frontend ---
echo Avvio frontend su http://127.0.0.1:5173 ...
start "ChatKitLocal FRONTEND" cmd /k "cd /d %cd%\frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 2 >nul
start http://127.0.0.1:5173

exit /b 0
