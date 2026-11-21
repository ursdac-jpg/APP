'use strict';
/* ============================================================
   scripts/importRome/genererNomsEmploi.js
   Produit data/rome/nomsEmploi.js : les NOMS D'EMPLOI les plus courants de chaque métier (trois par métier) et leur nombre total, pour la ligne « Aussi appelé »
   des cartes de métiers du module « Explorer les métiers » (consigne 498). Calculé à partir des fiches complètes data/rome/fiche_*.js (champ « n », les plus courants
   d'abord) et nettoyé par la fonction commune pmcNomsEmploi (forme masculine, sans doublon, sans le nom du métier lui-même) : aucune liste écrite à la main, aucun
   paquet CSV nécessaire. Chargé À LA DEMANDE avec les données du module (jamais par index.html).
     node scripts/importRome/genererNomsEmploi.js
   À relancer après toute régénération des fiches : tests/nomsEmploi.test.js échoue si le fichier ne correspond plus aux fiches.

   Contenu de NOMS_EMPLOI : { "J1501": [ [ "nom 1", "nom 2", "nom 3" ], nombre total de noms d'emploi ], ... } ; un code sans autre nom n'y figure pas.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const dossier = path.join(__dirname, '..', '..', 'data', 'rome');
const NB_NOMS = 3;

function lireFiches() {
  const fiches = {};
  fs.readdirSync(dossier).filter((f) => /^fiche_[A-N]\.js$/.test(f)).sort().forEach((f) => {
    Object.assign(fiches, require(path.join(dossier, f)).FICHES_ROME_LETTRE);
  });
  return fiches;
}

// Nom du métier tel que l'application l'écrit (première fiche de la base pour un code ROME, comme parMetierDonnees.js).
function nomsDeMetiers() {
  const base = require('../../data/metiers.js').baseMetiers, parCode = {};
  base.forEach((f) => { if (f.rome && !parCode[f.rome]) { parCode[f.rome] = String(f.nom).replace(/\s+/g, ' ').trim(); } });
  return parCode;
}

// Construit la table (objet) ; exportée pour que le test puisse recalculer et comparer.
function construireNoms(fiches, nomsMetiers, nettoyer) {
  const sortie = {};
  Object.keys(fiches).sort().forEach((code) => {
    const noms = nettoyer(fiches[code].n || [], nomsMetiers[code] || '');
    if (noms.length) { sortie[code] = [noms.slice(0, NB_NOMS), noms.length]; }
  });
  return sortie;
}

function entete() {
  return '/* ============================================================\n' +
    '   data/rome/nomsEmploi.js -- FICHIER GÉNÉRÉ, NE JAMAIS LE MODIFIER À LA MAIN.\n' +
    '   Les trois noms d’emploi les plus courants de chaque métier et leur nombre total : { "J1501": [ [ "nom 1", "nom 2", "nom 3" ], total ] }. Chargé À LA DEMANDE.\n' +
    '   Produit par : node scripts/importRome/genererNomsEmploi.js (à partir des fiches data/rome/fiche_*.js).\n' +
    '   ============================================================ */\n';
}

function ecrire() {
  const { pmcNomsEmploi } = require('../../modules/comprendre-les-metiers/parMetierCalcul.js');
  const table = construireNoms(lireFiches(), nomsDeMetiers(), pmcNomsEmploi);
  const corps = 'var NOMS_EMPLOI = ' + JSON.stringify(table) + ';\n\n' +
    'if (typeof window !== "undefined") { window.NOMS_EMPLOI = NOMS_EMPLOI; }\n' +
    'if (typeof module !== "undefined" && module.exports) { module.exports = { NOMS_EMPLOI: NOMS_EMPLOI }; }\n';
  fs.writeFileSync(path.join(dossier, 'nomsEmploi.js'), entete() + corps);
  console.log('Noms d’emploi : ' + Object.keys(table).length + ' métiers, ' + Math.round((entete().length + corps.length) / 1024) + ' Ko.');
}

if (require.main === module) { ecrire(); }
module.exports = { construireNoms, lireFiches, nomsDeMetiers, NB_NOMS };
