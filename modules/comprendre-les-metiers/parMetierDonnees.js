/* ============================================================
   Module « Explorer les métiers » : entrée 1, « Par un métier » : DONNÉES (aucun DOM, aucun stockage). Testé par tests/parMetierCalcul.test.js.
   Construit, une seule fois, le jeu de données que lisent le calcul (parMetierCalcul.js) et l'écran (parMetier.js), à partir de sources déjà existantes :
   - les fiches de l'application (baseMetiers, data/metiers.js : nom, code ROME, secteur, niveau d'accès) ;
   - l'INDEX COMPLET des compétences (data/rome/indexCompetences.js, chargé à la demande) : savoir-faire (489 macro-compétences), savoirs (ceux qui figurent dans
     au moins deux métiers, les autres ne sont pas cliquables), savoir-être officiels du ROME ;
   - les conditions de travail du ROME (data/conditionsRome.js) et les noms des compétences (data/competencesRome.js).
   Rien n'est recopié à la main : tout vient des données générées. Les listes courtes de data/metiersRome.js ne sont pas utilisées ici.
   Une ligne par métier : [nom, numéro de secteur, niveau d'accès (0 = non précisé), savoir-faire[], savoir-être[], savoirs[], conditions[]]
   (les numéros renvoient aux listes D.sf, D.se, D.sv, D.cond), plus .n (nom sans accents), .code (code ROME), .fiche (fiche de l'application).
   Navigateur : globales ; Node : require (comme logique.js).
   ============================================================ */

// Les 17 conditions de travail qui décrivent un effort, un rythme ou un cadre (pas les statuts possibles ni le télétravail).
var PMD_CLES_CONDITIONS = ['nuit', 'weekend', 'horaires', 'saisonnier', 'deplacements', 'charges', 'debout', 'assis', 'repetitif', 'precision', 'tenue', 'securite', 'bruit', 'exterieur', 'public', 'domicile', 'isole'];

// Les 16 savoir-être officiels du ROME rangés en quatre familles (familles proposées par Claude, à valider par Denis).
var PMD_FAMILLES_SE = [
  ['Avec les autres', ['Avoir l’esprit d’équipe', 'Être à l’écoute, faire preuve d’empathie', 'Avoir le sens du service', 'Faire preuve de leadership', 'Inspirer, donner du sens']],
  ['Sa manière de travailler', ['Faire preuve de rigueur et de précision', 'Organiser son travail selon les priorités et les objectifs', 'Faire preuve d’autonomie', 'Faire preuve de sens des responsabilités']],
  ['Face aux imprévus et à l’effort', ['Faire preuve de réactivité', 'Faire preuve de persévérance', 'Faire preuve de contrôle de soi', 'Être ouvert aux changements']],
  ['Penser, apprendre, imaginer', ['Faire preuve de créativité, d’inventivité', 'Faire preuve de curiosité, d’ouverture d’esprit', 'Être force de proposition']]
];

function _pmdNorm(t) { return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’'-]/g, ' ').replace(/\s+/g, ' ').trim(); }

// src : { base: [fiches], niveau: function (fiche) -> numéro | null, index: INDEX_COMPETENCES, conditions: CONDITIONS_ROME, competences: COMPETENCES_ROME }
function pmdConstruire(src) {
  var index = src.index, comp = src.competences, cond = src.conditions;
  // Un métier par code ROME (la base contient parfois deux fiches pour le même code).
  var parCode = {}, fiches = [];
  src.base.forEach(function (f) { if (f.rome && !parCode[f.rome]) { parCode[f.rome] = f; fiches.push(f); } });
  var secteurs = []; fiches.forEach(function (f) { if (secteurs.indexOf(f.secteur) === -1) { secteurs.push(f.secteur); } });
  secteurs.sort(function (a, b) { return a.localeCompare(b, 'fr'); });

  // Savoir-faire : les macro-compétences, rangées par famille (objectif du ROME), numéro de macro = numéro dans D.sf.
  var codesFam = []; comp.objectifs.forEach(function (o) { if (codesFam.indexOf(o) === -1) { codesFam.push(o); } });
  codesFam.sort();
  var sf = comp.phrases.map(function (p, i) { return { lib: p, fam: codesFam.indexOf(comp.objectifs[i]) }; });
  var sfFam = codesFam.map(function (c) { return index.of[c] || c; });
  // Savoir-être officiels
  var se = [], seFam = PMD_FAMILLES_SE.map(function (f) { return f[0]; });
  PMD_FAMILLES_SE.forEach(function (f, fi) { f[1].forEach(function (lib) { if (index.se[lib]) { se.push({ lib: lib, fam: fi }); } }); });
  Object.keys(index.se).sort().forEach(function (lib) { if (!se.some(function (x) { return x.lib === lib; })) { se.push({ lib: lib, fam: seFam.length }); } });
  if (se.some(function (x) { return x.fam === seFam.length; })) { seFam.push('Autres'); }
  var idSe = {}; se.forEach(function (x, i) { idSe[x.lib] = i; });
  // Savoirs partagés par au moins deux métiers
  var sv = index.sv.map(function (s) { return { lib: s[0], cat: s[1] }; });
  var svNums = []; sv.forEach(function (s) { if (svNums.indexOf(s.cat) === -1) { svNums.push(s.cat); } }); svNums.sort(function (a, b) { return a - b; });
  // Conditions de travail
  var libCond = PMD_CLES_CONDITIONS.map(function (k) { return cond.libelles[k]; });

  var lignes = fiches.map(function (f) {
    var n = src.niveau(f);
    var r = [String(f.nom).replace(/\s+/g, ' ').trim(), secteurs.indexOf(f.secteur), n === null || n === undefined ? 0 : n, [], [], [],
      (cond.parCode[f.rome] || []).map(function (k) { return PMD_CLES_CONDITIONS.indexOf(k); }).filter(function (x) { return x >= 0; })];
    r.code = f.rome; r.fiche = f; r.n = _pmdNorm(r[0]); r.coeur = { sf: {}, sv: {} };
    return r;
  });
  lignes.sort(function (a, b) { return a[0].localeCompare(b[0], 'fr'); });
  var idxCode = {}; lignes.forEach(function (r, i) { idxCode[r.code] = i; });
  var codeDe = function (s) { return s.replace(/\+\d*$/, ''); };
  var coeurDe = function (s) { return /\+/.test(s); };
  Object.keys(index.sf).forEach(function (m) {
    index.sf[m].forEach(function (s) { var i = idxCode[codeDe(s)]; if (i !== undefined) { lignes[i][3].push(Number(m)); if (coeurDe(s)) { lignes[i].coeur.sf[m] = 1; } } });
  });
  index.sv.forEach(function (s, id) {
    s[2].forEach(function (x) { var i = idxCode[codeDe(x)]; if (i !== undefined) { lignes[i][5].push(id); if (coeurDe(x)) { lignes[i].coeur.sv[id] = 1; } } });
  });
  Object.keys(index.se).forEach(function (lib) {
    index.se[lib].forEach(function (c) { var i = idxCode[c]; if (i !== undefined) { lignes[i][4].push(idSe[lib]); } });
  });
  lignes.forEach(function (r) { [3, 4, 5].forEach(function (k) { r[k].sort(function (a, b) { return a - b; }); }); });

  var D = { secteurs: secteurs, sf: sf, sfFam: sfFam, se: se, seFam: seFam, sv: sv, svCats: comp.categories, svNums: svNums, cond: libCond, condCles: PMD_CLES_CONDITIONS, m: lignes, idxCode: idxCode };
  // Inverse : pour chaque compétence, les métiers qui la citent
  D.inv = { sf: {}, se: {}, sv: {} };
  [['sf', 3], ['se', 4], ['sv', 5]].forEach(function (t) { lignes.forEach(function (r, i) { r[t[1]].forEach(function (id) { (D.inv[t[0]][id] = D.inv[t[0]][id] || []).push(i); }); }); });
  D.nbParSecteur = {}; lignes.forEach(function (r) { D.nbParSecteur[r[1]] = (D.nbParSecteur[r[1]] || 0) + 1; });
  return D;
}

// Données lues dans leurs sources réelles (globales du navigateur, sinon require en Node).
function pmdSources() {
  if (typeof baseMetiers !== 'undefined' && typeof INDEX_COMPETENCES !== 'undefined') {
    return { base: baseMetiers, niveau: typeof niveauAccesMetier === 'function' ? niveauAccesMetier : function () { return null; }, index: INDEX_COMPETENCES, conditions: CONDITIONS_ROME, competences: COMPETENCES_ROME };
  }
  var m = require('../../data/metiers.js');
  return { base: m.baseMetiers, niveau: m.niveauAccesMetier, index: require('../../data/rome/indexCompetences.js').INDEX_COMPETENCES,
    conditions: require('../../data/conditionsRome.js').CONDITIONS_ROME, competences: require('../../data/competencesRome.js').COMPETENCES_ROME };
}
var _pmdMemo = null;
function pmdDonnees() { if (!_pmdMemo) { _pmdMemo = pmdConstruire(pmdSources()); } return _pmdMemo; }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PMD_CLES_CONDITIONS: PMD_CLES_CONDITIONS, PMD_FAMILLES_SE: PMD_FAMILLES_SE, pmdConstruire: pmdConstruire, pmdSources: pmdSources, pmdDonnees: pmdDonnees, pmdNorm: _pmdNorm };
}
