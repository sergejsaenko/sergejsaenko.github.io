# Website for personal educational purposes (www.scaffiz.de)
--------------------
Transloco i18n:
Die Übersetzungsdateien befinden sich unter `src/assets/i18n/`.
Zur Laufzeit sind sie unter `./i18n/` erreichbar.

Verfügbare Skripte:
- `npm run prepare`: Erstellt spezielle Projekt-Bedingungen. Unteranderem für das Committen & Pushen auf master, sowie develop Branch.
- `npm run i18n:extract`: Extrahiert neue Übersetzungsschlüssel aus den HTML- und TS-Dateien und fügt sie den JSON-Dateien hinzu (siehe `transloco.config.js`).
- `npm run i18n:find`: Sucht nach fehlenden oder ungenutzten Übersetzungsschlüsseln.
