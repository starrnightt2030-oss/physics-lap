@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo توليد صوت شاكر - محتاج إنترنت وبايثون
python -m pip install --quiet edge-tts
python tools\make_shakir.py
pause
