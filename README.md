# Website for personal educational purposes

current problems:


--------------------
Build website:
angular.json -> "outputPath" under build should be "docs"
execute:
1. "ng build --configuration production --base-href ./"
2. Move-Item -Path .\docs\browser\* -Destination .\docs -Force
3. Remove-Item -Path .\docs\browser -Recurse -Force

Create:
1. CNAME with domain
2. Copy index.html and rename to 404.html
 
