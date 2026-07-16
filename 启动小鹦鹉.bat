@echo off
chcp 65001 >nul
title 小鹦鹉英语
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
echo 正在启动小鹦鹉英语学习应用...
echo 启动后请访问: http://localhost:8080
echo 按 Ctrl+C 可停止服务
echo.
npx vite --host
pause