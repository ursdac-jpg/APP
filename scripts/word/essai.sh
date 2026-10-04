#!/bin/bash
# Mesure un .docx recu du navigateur : Word -> PDF + positions des mots + image de la page demandee.
# Usage : WORD_NUIT='C:\chemin\dossier' scripts/word/essai.sh nom [page]
N="${WORD_NUIT:?definir WORD_NUIT (dossier du recepteur)}"
NOM="$1"
W="$(cygpath -w "$(cd "$(dirname "$0")/../.." && pwd)")"
BS='\'
powershell -NoProfile -ExecutionPolicy Bypass -File "${W}${BS}scripts${BS}word${BS}word-mesurer.ps1" -entree "${N}${BS}${NOM}.docx" -pdf "${N}${BS}${NOM}.pdf" -json "${N}${BS}${NOM}.word.json" -minuteur 90
powershell -NoProfile -ExecutionPolicy Bypass -File "${W}${BS}scripts${BS}word${BS}pdf-vers-png.ps1" -pdf "${N}${BS}${NOM}.pdf" -png "${N}${BS}${NOM}.png" -page "${2:-0}" -scale 0.9
