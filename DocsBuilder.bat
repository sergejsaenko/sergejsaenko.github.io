@echo off
REM Angular Build mit base-href=./
ng build --configuration production --base-href ./

REM CNAME-Datei mit Domain anlegen
echo www.scaffiz.de > .\docs\CNAME

REM index.html nach 404.html kopieren
powershell -Command "Copy-Item -Path .\docs\index.html -Destination .\docs\404.html -Force"

echo Fertig!
pause
