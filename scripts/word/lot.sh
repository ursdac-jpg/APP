#!/bin/bash
# Mesure plusieurs .docx recus : scripts/word/lot.sh nom1 nom2 ... (WORD_NUIT defini). Affiche une ligne de resume par modele.
for n in "$@"; do
  r=$(scripts/word/essai.sh "$n" | head -1)
  s=$(node scripts/word/comparer.js "$(cygpath -w "$(cygpath -u "$WORD_NUIT")")" "$n" | tr -d '\n ' | sed 's/"exemplesManquants.*//')
  echo "$n | $r | $s"
done
