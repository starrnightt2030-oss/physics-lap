@echo off
chcp 65001 >nul
title Physics Lab - Mr. Mohamed Mahmoud
cd /d "%~dp0"
set "APP=%~dp0index.html"
set "URL=file:///%APP:\=/%"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%CHROME%" goto chrome
if exist "%EDGE%" goto edge
start "" "%APP%"
goto :eof
:chrome
start "" "%CHROME%" --app="%URL%" --start-maximized
goto :eof
:edge
start "" "%EDGE%" --app="%URL%" --start-maximized
goto :eof
