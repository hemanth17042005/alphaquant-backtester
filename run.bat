@echo off
title AlphaQuant Backtesting Platform
echo Starting AlphaQuant Automated Trading Strategy Backtesting Platform...
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" start.py
) else (
    python start.py
)
pause
