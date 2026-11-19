'use strict';
/* ============================================================
   scripts/importRome/genererIndexCompetences.js
   Produit data/rome/indexCompetences.js : l'INDEX COMPLET des compétences, pour répondre à « dans quels métiers cette compétence compte-t-elle le plus ? »
   (module « Explorer les métiers », puis tout module qui voudra rendre une compétence cliquable). Calculé à partir des fiches complètes data/rome/fiche_*.js
   (aucun paquet CSV nécessaire) : une seule source, jamais de liste recopiée à la main. Chargé À LA DEMANDE (jamais par index.html).
     node scripts/importRome/genererIndexCompetences.js [dossier CSV ROME]   (le dossier CSV n'est utile que pour lire les noms des familles, champ « of »)
   À relancer après toute régénération ou correction des fiches : tests/indexCompetences.test.js échoue si l'index ne correspond plus aux fiches.

   Contenu de INDEX_COMPETENCES :
     sf : { "<numéro de macro-compétence>": [ "F1104+2", "F1202", ... ] }   savoir-faire (les 489 macro-compétences de data/competencesRome.js).
          Codes ROME classés du métier où la compétence compte le plus au moins ; « +n » = n activités « cœur de métier » du ROME pour cette macro dans ce métier.
          Classement : cœur de métier d'abord (plus il y en a, plus haut), puis nombre d'activités détaillées de la macro dans le métier, puis code.
     sv : [ [ "libellé du savoir", numéro de catégorie, [ "F1104+", "F1202", ... ] ], ... ]   savoirs présents dans AU MOINS DEUX métiers (les savoirs d'un seul métier
          ne sont pas cliquables : ils restent écrits sur la fiche). « + » = savoir « cœur de métier » du ROME. Classement : cœur de métier d'abord, puis les métiers
          qui ont le moins de savoirs (le savoir y pèse davantage), puis code.
     of : { "1A1": "Animer des activités", ... }   noms des 84 familles de savoir-faire (codes de data/competencesRome.js, champ objectifs).
     se : { "libellé officiel": [ "F1104", ... ] }   savoir-être officiels (champ « e » des fiches) ; le ROME ne les pondère pas : classés par code.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const dossier = path.join(__dirname, '..', '..', 'data', 'rome');

function lireFiches() {
  const fiches = {};
  fs.readdirSync(dossier).filter((f) => /^fiche_[A-N]\.js$/.test(f)).sort().forEach((f) => {
    Object.assign(fiches, require(path.join(dossier, f)).FICHES_ROME_LETTRE);
  });
  return fiches;
}

// Construit l'index (objet) à partir des fiches. Exportée pour que le test puisse recalculer et comparer.
function construireIndex(fiches, objectifs) {
  const codes = Object.keys(fiches).sort();
  const sf = {};      // macro -> [{ code, coeur, total }]
  const sv = {};      // libellé -> { cat, metiers: [{ code, coeur, nbSavoirs }] }
  const se = {};      // libellé -> [code]
  codes.forEach((code) => {
    const f = fiches[code];
    (f.k || []).forEach((g) => { (sf[g[0]] = sf[g[0]] || []).push({ code: code, coeur: g[1], total: g[2].length }); });
    const nbSavoirs = (f.s || []).reduce((n, g) => n + g[2].length, 0);
    (f.s || []).forEach((g) => {
      g[2].forEach((lib, i) => {
        const e = (sv[lib] = sv[lib] || { cat: g[0], metiers: [] });
        e.metiers.push({ code: code, coeur: i < g[1] ? 1 : 0, nbSavoirs: nbSavoirs });
      });
    });
    (f.e || []).forEach((lib) => { (se[lib] = se[lib] || []).push(code); });
  });
  const idx = { of: objectifs || {}, sf: {}, sv: [], se: {} };
  Object.keys(sf).sort((a, b) => Number(a) - Number(b)).forEach((m) => {
    idx.sf[m] = sf[m].sort((a, b) => (b.coeur - a.coeur) || (b.total - a.total) || (a.code < b.code ? -1 : 1)).map((x) => x.code + (x.coeur ? '+' + x.coeur : ''));
  });
  Object.keys(sv).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).forEach((lib) => {
    const e = sv[lib];
    if (e.metiers.length < 2) { return; }
    idx.sv.push([lib, e.cat, e.metiers.sort((a, b) => (b.coeur - a.coeur) || (a.nbSavoirs - b.nbSavoirs) || (a.code < b.code ? -1 : 1)).map((x) => x.code + (x.coeur ? '+' : ''))]);
  });
  Object.keys(se).sort().forEach((lib) => { idx.se[lib] = se[lib].slice().sort(); });
  return idx;
}

function entete() {
  return '/* ============================================================\n' +
    '   data/rome/indexCompetences.js -- FICHIER GÉNÉRÉ, NE JAMAIS LE MODIFIER À LA MAIN.\n' +
    '   Index complet des compétences du ROME : pour chaque compétence, les métiers où elle compte le plus (classés). Chargé À LA DEMANDE.\n' +
    '   sf = savoir-faire par numéro de macro-compétence (data/competencesRome.js) : codes classés, « +n » = n activités cœur de métier ;\n' +
    '   sv = savoirs présents dans au moins deux métiers : [libellé, numéro de catégorie, codes classés, « + » = cœur de métier] ; se = savoir-être officiels : libellé -> codes.\n' +
    '   Produit par : node scripts/importRome/genererIndexCompetences.js (à partir des fiches data/rome/fiche_*.js). Règles de classement : en-tête de ce programme.\n' +
    '   ============================================================ */\n';
}

// Noms des familles de savoir-faire (« objectifs » du ROME, code -> libellé) : lus dans le paquet CSV si son dossier est donné en argument,
// sinon repris tels quels de l'index déjà produit (les fiches seules ne les contiennent pas).
function lireObjectifs() {
  const dossierCsv = process.argv[2];
  if (dossierCsv) {
    const o = require('./lireRome.js').chargerRome(dossierCsv).objectifsLibelles;
    const net = {}; Object.keys(o).sort().forEach((k) => { net[k] = String(o[k]).replace(/'/g, '’'); });
    return net;
  }
  try { return require(path.join(dossier, 'indexCompetences.js')).INDEX_COMPETENCES.of || {}; } catch (e) { return {}; }
}

function ecrire() {
  const idx = construireIndex(lireFiches(), lireObjectifs());
  const corps = 'var INDEX_COMPETENCES = ' + JSON.stringify(idx) + ';\n\n' +
    'if (typeof window !== "undefined") { window.INDEX_COMPETENCES = INDEX_COMPETENCES; }\n' +
    'if (typeof module !== "undefined" && module.exports) { module.exports = { INDEX_COMPETENCES: INDEX_COMPETENCES }; }\n';
  const chemin = path.join(dossier, 'indexCompetences.js');
  fs.writeFileSync(chemin, entete() + corps);
  const nbSf = Object.keys(idx.sf).length;
  const paires = Object.keys(idx.sf).reduce((n, m) => n + idx.sf[m].length, 0) + idx.sv.reduce((n, s) => n + s[2].length, 0);
  console.log('Index des compétences : ' + nbSf + ' macro-compétences, ' + idx.sv.length + ' savoirs partagés, ' + Object.keys(idx.se).length + ' savoir-être, ' + paires + ' liens ; ' + Math.round(fs.statSync(chemin).size / 1024) + ' Ko');
}

if (require.main === module) { ecrire(); }
module.exports = { construireIndex, lireFiches };
