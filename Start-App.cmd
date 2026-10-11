@echo off
setlocal
if not exist "%~dp0PromptAtelier.html" (
  echo PromptAtelier.html was not found.
  pause
  exit /b 1
)
start "" "%~dp0PromptAtelier.html"
