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
