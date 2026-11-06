@echo off
rem Double-cliquez sur ce fichier une fois par an, au printemps, quand France Travail publie la nouvelle enquete BMO.
rem Avant : telechargez le fichier .xlsx de l enquete et deposez-le dans PROSPECTION\donnees_externes\bmo (le plus recent est lu).
rem Il met a jour la liste "Metiers qui recrutent le plus" de Comprendre les chiffres (scripts\genereBmoMetiers.js).
cd /d "%~dp0.."
echo.
echo Mise a jour de la liste des metiers qui recrutent le plus...
echo.
set /p DATEPUB=Date de publication de l enquete (ANNEE-MOIS-JOUR, par exemple 2027-04-20) : 
where node >/dev/null 2>nul
if %errorlevel%==0 (
  node scripts\genereBmoMetiers.js --xlsx %DATEPUB%
) else (
  "C:\Program Files\nodejs\node.exe" scripts\genereBmoMetiers.js --xlsx %DATEPUB%
)
echo.
echo Termine. Ensuite : npm test, une ligne dans docs\JOURNAL_DES_CHANGEMENTS.md, puis demandez a Claude de valider et de faire le commit.
pause
