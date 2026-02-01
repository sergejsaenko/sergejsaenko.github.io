# Website for personal educational purposes (www.scaffiz.de)

current problems:


--------------------
Build website:
angular.json -> "outputPath" under build should be "docs"
execute:
1. "ng build --configuration production --base-href ./"
2. Move-Item -Path .\docs\browser\* -Destination .\docs -Force
3. Remove-Item -Path .\docs\browser -Recurse -Force
4. echo www.scaffiz.de > .\docs\CNAME
5. Copy-Item -Path .\docs\index.html -Destination .\docs\404.html -Force

--------------------
Transloco i18n:
Die Übersetzungsdateien befinden sich unter `src/assets/i18n/`.
Zur Laufzeit sind sie unter `./i18n/` erreichbar.

Verfügbare Skripte:
- `npm run i18n:extract`: Extrahiert neue Übersetzungsschlüssel aus den HTML- und TS-Dateien und fügt sie den JSON-Dateien hinzu (siehe `transloco.config.js`).
- `npm run i18n:find`: Sucht nach fehlenden oder ungenutzten Übersetzungsschlüsseln.
