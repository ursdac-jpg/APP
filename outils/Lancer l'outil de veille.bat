@echo off
rem Double-cliquez sur ce fichier : il demarre le petit serveur local de l'outil de veille et ouvre l'outil dans votre navigateur.
rem (Votre raccourci habituel vers outils\veille.html continue de fonctionner tel quel : ce lanceur est un AJOUT, il ne le remplace pas.)
rem Le serveur n'est joignable que depuis cet ordinateur. Pour l'arreter : fermez cette fenetre.
cd /d "%~dp0.."
echo.
echo Demarrage de l'outil de veille...
where node >nul 2>nul
if %errorlevel%==0 (
  node outils\serveur_veille.js
) else (
  "C:\Program Files\nodejs\node.exe" outils\serveur_veille.js
)
echo.
echo Le serveur est arrete. Vous pouvez fermer cette fenetre.
pause
