@echo off
REM Angular Build mit base-href=./
ng build --configuration production --base-href ./

REM browser-Inhalt nach docs verschieben und browser-Ordner löschen
powershell -Command "Move-Item -Path .\docs\browser\* -Destination .\docs -Force"
powershell -Command "Remove-Item -Path .\docs\browser -Recurse -Force"

REM CNAME-Datei mit Domain anlegen
echo www.scaffiz.de > .\docs\CNAME

REM index.html nach 404.html kopieren
Copy-Item -Path .\docs\index.html -Destination .\docs\404.html -Force

echo Fertig!
pause
