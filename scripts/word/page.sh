#!/bin/bash
# Image d'une page (0 = premiere) du PDF d'un essai : WORD_NUIT='C:\dossier' scripts/word/page.sh nom page [echelle]
N="${WORD_NUIT:?definir WORD_NUIT}"; NOM="$1"; PAGE="${2:-0}"; ECH="${3:-0.7}"
W="$(cygpath -w "$(cd "$(dirname "$0")/../.." && pwd)")"; BS='\'
powershell -NoProfile -ExecutionPolicy Bypass -File "${W}${BS}scripts${BS}word${BS}pdf-vers-png.ps1" -pdf "${N}${BS}${NOM}.pdf" -png "${N}${BS}${NOM}_p$((PAGE+1)).png" -page "$PAGE" -scale "$ECH"
