'use strict';
/* ============================================================
   scripts/importRome/auditerFichesMain.js
   Compare les 139 fiches ÉCRITES À LA MAIN (data/metiers.js) avec ce que dit le ROME pour le même code (même traduction que les fiches générées).
   Pour chaque fiche et chaque liste (savoir-faire, savoir-être, savoirs) :
     - « seulement chez nous » : mots de la fiche que le ROME ne soutient pas pour ce code (à garder si Denis le décide : un métier peut avoir une particularité) ;
     - « manque chez nous » : mots que le ROME place parmi les plus importants du code et que la fiche n'a pas.
   Ne modifie rien : écrit seulement le rapport docs/AUDIT_FICHES_MAIN_CONTRE_ROME_2026-11-12.md.
   Usage : node scripts/importRome/auditerFichesMain.js <dossier CSV ROME>
   ============================================================ */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const T = require('./tablesRome.js'); // contient SAVOIR_ETRE (comme completerFichesMain.js)
const { calculerFrequences, motsDuCode } = require('./traducteurCompetences.js');
const { chargerRome } = require('./lireRome.js');
const { baseMetiersDetaillees } = require(path.join(RACINE, 'data', 'metiers.js'));

const dossier = process.argv[2];
if (!dossier) { console.error('Usage : node scripts/importRome/auditerFichesMain.js <dossier CSV ROME>'); process.exit(1); }
const rome = chargerRome(dossier);
calculerFrequences(rome);
// Même table que completerFichesMain.js (décision technique, à relire par Denis)
const CODE_PAR_FICHE = { webmaster: 'M1805', technicien_son_lumiere: 'L1504' };

const COTES = [['sf', 'savoirFaire', 'Savoir-faire', 2], ['se', 'savoirEtre', 'Savoir-être', 3], ['sv', 'savoirs', 'Savoirs', 3]];
const lignes = [], sansCode = [];
let nbFiches = 0, nbEcarts = 0, nbManques = 0, nbFichesSansEcart = 0;
baseMetiersDetaillees.forEach((m) => {
  const code = m.rome || CODE_PAR_FICHE[m.id];
  const f = code && rome.codes[code];
  if (!f) { sansCode.push(m.nom + ' (' + m.id + ')'); return; }
  nbFiches++;
  let ecartsFiche = 0;
  const sorties = [];
  COTES.forEach(([cote, champ, nom, seuil]) => {
    const tous = motsDuCode(f, cote);
    const ensemble = new Set(tous.map((x) => x.mot));
    if (cote === 'se') { f.savoirEtre.forEach((l) => (T.SAVOIR_ETRE[l] || []).forEach((x) => ensemble.add(x))); }
    const nbMax = tous.length ? Math.max.apply(null, tous.map((x) => x.nb)) : 0;
    const forts = tous.filter((x) => x.nb >= Math.max(seuil, 0.35 * nbMax)).slice(0, 4).map((x) => x.mot);
    const maListe = m[champ] || [];
    const seulement = maListe.filter((x) => !ensemble.has(x));
    const manque = forts.filter((x) => maListe.indexOf(x) === -1);
    ecartsFiche += seulement.length + manque.length;
    nbEcarts += seulement.length; nbManques += manque.length;
    if (seulement.length || manque.length) { sorties.push('- ' + nom + (seulement.length ? ' ; seulement chez nous : ' + seulement.join(', ') : '') + (manque.length ? ' ; manque chez nous : ' + manque.join(', ') : '')); }
  });
  if (!ecartsFiche) { nbFichesSansEcart++; return; }
  lignes.push('### ' + m.nom + ' (code ' + code + (m.rome ? '' : ', code proposé, la fiche n\'en a pas') + ')\n' + sorties.join('\n') + '\n');
});

const doublons = {};
baseMetiersDetaillees.filter((m) => m.rome).forEach((m) => { (doublons[m.rome] = doublons[m.rome] || []).push(m.nom); });
const partages = Object.keys(doublons).filter((c) => doublons[c].length > 1).map((c) => '- ' + c + ' : ' + doublons[c].join(' et '));

const rapport = '# Audit des fiches écrites à la main contre le ROME (12/11/2026)\n\n' +
  'Produit par `scripts/importRome/auditerFichesMain.js`. Rien n\'a été modifié dans les fiches : ce rapport sert à décider, fiche par fiche, ce qui reste tel quel et ce qui s\'ajoute.\n\n' +
  '- Fiches comparées : ' + nbFiches + ' sur ' + baseMetiersDetaillees.length + '\n' +
  '- Fiches sans aucun écart : ' + nbFichesSansEcart + '\n' +
  '- Mots « seulement chez nous » (le ROME ne les soutient pas pour ce code) : ' + nbEcarts + '\n' +
  '- Mots « qui manquent chez nous » (importants dans le ROME, absents de la fiche) : ' + nbManques + '\n\n' +
  '## Comment lire ce rapport\n\n' +
  '- **Savoirs, « seulement chez nous »** : normal, pas une erreur. Vos savoirs écrits à la main (« Techniques de vente », « Scripts d\'appel ») sont plus précis que les catégories traduites du ROME ; ils sont gardés.\n' +
  '- **Savoir-être, « manque chez nous »** : surtout Rigueur, Responsabilité, Organisation, que le ROME place dans presque tous les métiers. Peu utile, à ne pas ajouter partout.\n' +
  '- **Savoir-faire, « manque chez nous »** : c\'est la partie utile (par exemple « Vente » absent d\'une fiche de vendeur). À arbitrer fiche par fiche.\n' +
  '- **Savoir-faire et savoir-être, « seulement chez nous »** : à regarder, mais le ROME est parfois moins détaillé que vous.\n\n' +
  '## Fiches sans code du ROME\n\n' + (sansCode.length ? sansCode.map((x) => '- ' + x).join('\n') : 'Aucune.') + '\n\n' +
  '## Codes du ROME partagés par deux fiches écrites à la main\n\n' + (partages.length ? partages.join('\n') : 'Aucun.') + '\n\n' +
  '## Écarts fiche par fiche\n\n' + lignes.join('\n');
const sortie = path.join(RACINE, 'docs', 'AUDIT_FICHES_MAIN_CONTRE_ROME_2026-11-12.md');
fs.writeFileSync(sortie, rapport);
console.log('Fiches comparées ' + nbFiches + ' ; sans écart ' + nbFichesSansEcart + ' ; seulement chez nous ' + nbEcarts + ' ; manque chez nous ' + nbManques + ' ; sans code ' + sansCode.length + '. Rapport : ' + sortie);
