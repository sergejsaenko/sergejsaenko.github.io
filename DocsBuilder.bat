@echo off
REM Angular Build mit base-href=./
ng build --configuration production --base-href ./

REM CNAME-Datei mit Domain anlegen
echo www.scaffiz.de > .\docs\CNAME

REM index.html nach 404.html kopieren (fuer SPA-Routing auf GitHub Pages)
copy .\docs\index.html .\docs\404.html

echo Fertig!
pause
