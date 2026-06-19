@echo off
title Quan Ly Du An Server
echo Dang khoi dong server QuanLyDuAn...
timeout /t 1 >nul
start http://localhost:5173/QuanLyTaiLieu/
npm.cmd run dev
