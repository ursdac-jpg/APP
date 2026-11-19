'use strict';
/* ============================================================
   scripts/importRome/genererNiveauxVerifies.js
   Génère data/niveauxAccesVerifies.js : le niveau d'accès des métiers du ROME qui n'en ont pas dans le ROME lui-même
   (METIERS_ROME_NIVEAUX de data/metiersRome.js). Les niveaux ont été lus fiche par fiche sur MétierScope (France Travail) le 17/11/2026,
   les doutes tranchés par Denis (docs/NIVEAUX_VERIFIES_PAR_ASSISTANT_2026-11-17.json, rubrique « niveaux »).
   Échelle : 2 sans diplôme, 3 CAP/BEP, 4 Bac, 5 Bac+2, 6 Bac+3, 7 Bac+5, 8 études longues. Un métier absent reste « non précisé » : jamais de niveau inventé.
   Usage : node scripts/importRome/genererNiveauxVerifies.js
   data/niveauxAccesVerifies.js ne se modifie JAMAIS à la main : corriger le fichier JSON des niveaux, puis régénérer.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const source = JSON.parse(fs.readFileSync(path.join(RACINE, 'docs', 'NIVEAUX_VERIFIES_PAR_ASSISTANT_2026-11-17.json'), 'utf8'));
const niveaux = {};
Object.keys(source.niveaux).sort().forEach((code) => {
  const n = source.niveaux[code];
  if (!/^[A-N]\d{4}$/.test(code) || !Number.isInteger(n) || n < 2 || n > 8) { throw new Error('Niveau invalide : ' + code + ' ' + n); }
  niveaux[code] = n;
});
const corps = '/* GÉNÉRÉ par scripts/importRome/genererNiveauxVerifies.js : ne pas modifier à la main.\n' +
  '   Niveau d’accès des métiers du ROME dont le ROME ne donne aucun niveau (lus sur MétierScope le 17/11/2026, doutes tranchés par Denis).\n' +
  '   2 sans diplôme, 3 CAP/BEP, 4 Bac, 5 Bac+2, 6 Bac+3, 7 Bac+5, 8 études longues. Absent = non précisé. Le niveau du ROME passe toujours avant celui-ci. */\n' +
  'var METIERS_ROME_NIVEAUX_VERIFIES = ' + JSON.stringify(niveaux) + ';\n\n' +
  'if (typeof module !== "undefined" && module.exports) { module.exports = { METIERS_ROME_NIVEAUX_VERIFIES: METIERS_ROME_NIVEAUX_VERIFIES }; }\n';
fs.writeFileSync(path.join(RACINE, 'data', 'niveauxAccesVerifies.js'), corps);
console.log('Niveaux vérifiés écrits : ' + Object.keys(niveaux).length);
