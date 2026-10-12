@echo off
rem Double-cliquez sur ce fichier apres avoir modifie une fiche : il met a jour la base lue par l'outil de veille.
rem (Il lance scripts\genererBaseVeille.js, qui recopie toutes les fiches dans outils\base_fiches.js.)
cd /d "%~dp0.."
echo.
echo Mise a jour de la base de l'outil de veille...
echo.
where node >nul 2>nul
if %errorlevel%==0 (
  node scripts\genererBaseVeille.js
) else (
  "C:\Program Files\nodejs\node.exe" scripts\genererBaseVeille.js
)
echo.
echo Termine. Vous pouvez fermer cette fenetre, puis recharger l'outil de veille dans le navigateur.
pause
