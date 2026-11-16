// Mesure ce que le ROME 4.0 de France Travail dit de chacun de ses 1 923 codes (fiches métier), pour juger si les listes de choix de « Votre parcours »
// (avec qui, avec quoi, ce que vous faisiez, où vous travailliez) couvrent l'ensemble des métiers (consigne 262 de Denis, 12/11/2026).
//
// Usage : node scripts/mesureCouvertureRome.js <dossier des CSV ROME décompressés> <fichier de sortie .json>
// Rien n'est écrit dans l'application : le script LIT les fichiers officiels et écrit un fichier de mesures.
//
// Ce que le script compte, par nombre de CODES ROME concernés (un code = une fiche métier ; 1 923 au total) :
//   - objectifs  : les 84 « objectifs » de compétences de l'arborescence officielle (domaine > enjeu > objectif > macro-compétence > compétence) ;
//   - macros     : les 506 macro-compétences, avec leur objectif ;
//   - verbes     : le premier mot (le verbe) de chaque compétence, avec le nombre de codes ROME et quelques exemples ;
//   - savoirs    : catégories et sous-catégories de savoirs (matières, outils, techniques...), et chaque savoir ;
//   - contextes  : les contextes de travail (publics, structures, conditions, horaires, statut d'emploi).
const fs = require('fs');
const path = require('path');

const dossier = process.argv[2];
const sortie = process.argv[3];
if (!dossier || !sortie) { console.error('Usage : node scripts/mesureCouvertureRome.js <dossier CSV ROME> <sortie.json>'); process.exit(1); }

// Le lecteur CSV est partagé avec l'import des métiers du ROME (une seule copie dans le dépôt)
const { lireCsv: lireCsvRome } = require('./importRome/lireRome.js');
const lireCsv = (nom) => lireCsvRome(dossier, nom);

const codes = lireCsv('unix_referentiel_code_rome_v462_utf8.csv');
const liens = lireCsv('unix_liens_rome_referentiels_v462_utf8.csv');
const arbo = lireCsv('unix_arborescence_competences_v462_utf8.csv');
const savoirs = lireCsv('unix_referentiel_savoir_v462_utf8.csv');
const contextes = lireCsv('unix_referentiel_contexte_travail_v462_utf8.csv');
const nbCodes = codes.length;

// competence (code_ogr) -> { macro, objectif, enjeu, domaine }
const parCompetence = {};
arbo.forEach((a) => { parCompetence[a.code_ogr_competence] = a; });
const parSavoir = {}; savoirs.forEach((s) => { parSavoir[s.code_ogr_savoir] = s; });
const parContexte = {}; contextes.forEach((c) => { parContexte[c.code_ogr] = c; });

// Pour chaque code ROME : ensembles d'identifiants rencontrés.
const parCode = {};
function ens(code) { return (parCode[code] = parCode[code] || { objectifs: new Set(), macros: new Set(), savoirs: new Set(), contextes: new Set(), verbes: new Set() }); }
const exemplesVerbes = {};
liens.forEach((l) => {
  const e = ens(l.code_rome);
  if (l.code_compo_bloc === '5' && l.code_rubrique === '1') {
    const a = parCompetence[l.code_ogr];
    if (a) {
      e.objectifs.add(a.code_objectif); e.macros.add(a.code_macro_competence);
      const v = (a.libelle_competence || '').trim().split(' ')[0].toLowerCase();
      if (v) { e.verbes.add(v); (exemplesVerbes[v] = exemplesVerbes[v] || []); if (exemplesVerbes[v].length < 3 && exemplesVerbes[v].indexOf(a.libelle_competence) === -1) { exemplesVerbes[v].push(a.libelle_competence); } }
    }
  } else if (l.code_compo_bloc === '5' && l.code_rubrique === '3') {
    if (parSavoir[l.code_ogr]) { e.savoirs.add(l.code_ogr); }
  } else if (l.code_compo_bloc === '6') {
    if (parContexte[l.code_ogr]) { e.contextes.add(l.code_ogr); }
  }
});

function compter(cle, selecteur) {
  const n = {};
  Object.keys(parCode).forEach((code) => { parCode[code][cle].forEach((id) => { n[id] = (n[id] || 0) + 1; }); });
  return n;
}
const nObj = compter('objectifs'), nMac = compter('macros'), nSav = compter('savoirs'), nCtx = compter('contextes'), nVer = compter('verbes');

const objectifs = {};
arbo.forEach((a) => {
  const o = objectifs[a.code_objectif] = objectifs[a.code_objectif] || { code: a.code_objectif, objectif: a.objectif, enjeu: a.enjeu, domaine: a.domaine_competence, codesRome: nObj[a.code_objectif] || 0, macros: {} };
  o.macros[a.code_macro_competence] = { libelle: a.libelle_macro_competence, codesRome: nMac[a.code_macro_competence] || 0 };
});
const out = {
  version: fs.readFileSync(path.join(dossier, 'version.txt'), 'utf8').split(/\r?\n/).filter(Boolean).slice(0, 3),
  nbCodesRome: nbCodes,
  objectifs: Object.values(objectifs).sort((a, b) => b.codesRome - a.codesRome),
  savoirs: savoirs.map((s) => ({ libelle: s.libelle_savoir, categorie: s.categorie_savoir, sousCategorie: s.sous_categorie_savoir, codesRome: nSav[s.code_ogr_savoir] || 0 })).filter((s) => s.codesRome > 0).sort((a, b) => b.codesRome - a.codesRome),
  verbes: Object.keys(nVer).map((v) => ({ verbe: v, codesRome: nVer[v], exemples: exemplesVerbes[v] })).sort((a, b) => b.codesRome - a.codesRome),
  contextes: contextes.map((c) => ({ libelle: c.libelle_cont_travail, type: c.libelle_type_cont_trav, codesRome: nCtx[c.code_ogr] || 0 })).sort((a, b) => b.codesRome - a.codesRome)
};
fs.writeFileSync(sortie, JSON.stringify(out, null, 1));
// Détail PAR CODE ROME (pour mesurer, code par code, ce que couvrent les listes de choix) : <sortie>.parcode.json
const detail = {};
codes.forEach((c) => {
  const e = parCode[c.code_rome] || { objectifs: new Set(), savoirs: new Set(), contextes: new Set(), verbes: new Set() };
  const sav = [...e.savoirs].map((id) => parSavoir[id]);
  detail[c.code_rome] = {
    libelle: c.libelle_rome,
    objectifs: [...e.objectifs],
    verbes: [...e.verbes],
    contextes: [...e.contextes].map((id) => [parContexte[id].libelle_cont_travail, parContexte[id].libelle_type_cont_trav]),
    savoirsSousCategories: [...new Set(sav.map((x) => x.categorie_savoir + ' > ' + x.sous_categorie_savoir))],
    savoirsProduits: sav.filter((x) => x.categorie_savoir === 'Produits, outils et matières').map((x) => x.libelle_savoir)
  };
});
fs.writeFileSync(sortie.replace('.json', '') + '.parcode.json', JSON.stringify(detail));
console.log('codes ROME', nbCodes, '| objectifs', out.objectifs.length, '| savoirs utilisés', out.savoirs.length, '| contextes', out.contextes.length);
