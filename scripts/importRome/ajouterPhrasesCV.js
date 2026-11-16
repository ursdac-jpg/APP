'use strict';
/* ============================================================
   scripts/importRome/ajouterPhrasesCV.js
   Applique aux fichiers data/rome/fiche_*.js DÉJÀ PRODUITS ce que genererMetiersRome.js fait à la génération (sans avoir besoin du paquet CSV du ROME) :
   champ mi (missions à l'infinitif, phrases prêtes à cocher pour le CV) et remise en forme des activités (champ k). Voir scripts/importRome/phrasesCV.js.
   À relancer après toute modification de scripts/importRome/phrasesCV.js ou de scripts/importRome/phrasesCorrigees.json :
     node scripts/importRome/ajouterPhrasesCV.js
   Idempotent : les missions d'origine (champ m) ne sont jamais modifiées.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const PCV = require('./phrasesCV.js');

const dossier = path.join(__dirname, '..', '..', 'data', 'rome');
const fichiers = fs.readdirSync(dossier).filter((f) => /^fiche_[A-N]\.js$/.test(f)).sort();
const lettres = {};
fichiers.forEach((f) => { lettres[f] = require(path.join(dossier, f)).FICHES_ROME_LETTRE; });
// Option : K_ORIGINE_DIR = dossier contenant des fichiers fiche_*.js non retouchés (par exemple extraits de git) : les activités (champ k) repartent de ces originaux.
// Utile quand une règle de remise en forme change et que les phrases déjà écrites ne sont pas les bonnes.
if (process.env.K_ORIGINE_DIR) {
  fichiers.forEach((f) => {
    const orig = require(path.resolve(process.env.K_ORIGINE_DIR, f)).FICHES_ROME_LETTRE;
    Object.keys(lettres[f]).forEach((code) => { if (orig[code] && orig[code].k) { lettres[f][code].k = JSON.parse(JSON.stringify(orig[code].k)); } });
  });
}

// Corpus complet pour que le convertisseur connaisse tous les verbes
const missions = [], activites = [];
Object.keys(lettres).forEach((f) => Object.keys(lettres[f]).forEach((code) => {
  const e = lettres[f][code];
  (e.m || []).forEach((m) => missions.push(m));
  (e.k || []).forEach((g) => g[2].forEach((l) => activites.push(l)));
}));
PCV.preparer(missions, activites);

let nbMi = 0, nbPhrases = 0, nbActiviteModifiees = 0;
fichiers.forEach((f) => {
  const donnees = lettres[f];
  Object.keys(donnees).forEach((code) => {
    const e = donnees[code];
    const avant = JSON.stringify(e.k);
    delete e.mi;
    // Le champ k lu ici peut déjà avoir été remis en forme : la remise en forme est idempotente
    PCV.enrichirFiche(e);
    if (e.mi) { nbMi++; nbPhrases += e.mi.length; }
    if (JSON.stringify(e.k) !== avant) { nbActiviteModifiees++; }
  });
  const chemin = path.join(dossier, f);
  const ancien = fs.readFileSync(chemin, 'utf8');
  let entete = ancien.slice(0, ancien.indexOf('*/') + 3);
  if (entete.indexOf('mi = missions') === -1) {
    entete = entete.replace('m = missions,', 'm = missions, mi = missions à l\'infinitif prêtes à cocher pour le CV (phrasesCV.js),');
  }
  const corps = '(function (g) {\n  var P = g.FICHES_ROME = g.FICHES_ROME || {};\n  var donnees = ' + JSON.stringify(donnees) + ';\n  Object.keys(donnees).forEach(function (c) { P[c] = donnees[c]; });\n  if (typeof module !== "undefined" && module.exports) { module.exports = { FICHES_ROME_LETTRE: donnees }; }\n})(typeof window !== "undefined" ? window : globalThis);\n';
  fs.writeFileSync(chemin, entete + corps);
});
console.log('Fiches avec missions CV : ' + nbMi + ', phrases cochables : ' + nbPhrases + ', fiches dont des activités ont été remises en forme : ' + nbActiviteModifiees);
