@echo off
rem Double-cliquez sur ce fichier une fois par mois (ou quand vous voulez chercher des structures a proposer).
rem Il telecharge le fichier le plus recent de data.inclusion (data.gouv.fr), garde la Dordogne et la Haute-Vienne,
rem verifie chaque structure aupres de la base officielle des entreprises, retire ce que vous avez deja,
rem puis depose le resultat dans outils\prospection_structures. Il n ecrit RIEN dans le registre ni dans le sas.
rem Ensuite : ouvrez l outil de veille, onglet "Prospection des structures".
cd /d "%~dp0.."
echo.
echo Recherche de nouvelles structures (cela prend quelques minutes)...
echo.
where node >nul 2>nul
if %errorlevel%==0 (
  node scripts\prospectionStructures.js
) else (
  "C:\Program Files\nodejs\node.exe" scripts\prospectionStructures.js
)
echo.
echo Termine. Ouvrez maintenant l outil de veille : le resultat est dans l onglet "Prospection des structures".
pause
