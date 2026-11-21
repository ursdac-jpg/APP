'use strict';
// Règles essayées pour les cartes enrichies (consigne 509), à valider par Denis avant tout code de l'application. Lecture seule.
//  - compétences d'un métier : celles que le ROME marque « cœur de métier » d'abord, puis celles qui comptent le plus d'activités, pondérées par leur rareté dans la base ;
//  - conditions de travail : sans les statuts (indépendant, intérim, fonction publique, alternance), les plus RARES d'abord (ce sont elles qui distinguent un métier d'un autre).
// À lancer depuis la racine du dépôt : node scripts/auditCartes/choixCompetences.js (affiche quelques exemples).
const fs = require('fs'), path = require('path'), vm = require('vm');
const RACINE = path.join(__dirname, '..', '..');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(RACINE, 'data', 'competencesRome.js'), 'utf8') + fs.readFileSync(path.join(RACINE, 'data', 'conditionsRome.js'), 'utf8') + ';this.P=COMPETENCES_ROME;this.K=CONDITIONS_ROME', c);
const P = c.P, K = c.K;
const F = {}; 'ABCDEFGHIJKLMN'.split('').forEach((l) => Object.assign(F, require(path.join(RACINE, 'data', 'rome', 'fiche_' + l + '.js')).FICHES_ROME_LETTRE));
const M = require(path.join(RACINE, 'data', 'metiers.js'));
const N = Object.keys(F).length;
const freqComp = new Array(P.phrases.length).fill(0); Object.values(F).forEach((f) => (f.k || []).forEach((x) => { freqComp[x[0]]++; }));

// Toutes les compétences d'un code, de la plus représentative à la moins représentative : [phrase, ...].
function competences(code) {
  const f = F[code]; if (!f || !f.k) { return []; }
  return f.k.map((x) => ({ id: x[0], coeur: x[1], nb: (x[2] || []).length, rar: Math.log(N / (freqComp[x[0]] || 1)) }))
    .sort((a, b) => (b.coeur - a.coeur) || ((b.nb * b.rar) - (a.nb * a.rar))).map((x) => P.phrases[x.id]);
}
const choisir = (code, n) => competences(code).slice(0, n);

const STATUTS = ['s_independant', 's_interim', 's_public', 's_alternance'];
const freqCond = {}; Object.values(K.parCode).forEach((a) => a.forEach((i) => { freqCond[i] = (freqCond[i] || 0) + 1; }));
// Conditions de travail d'un code, les plus rares d'abord (égalité : ordre du ROME), sans les statuts : [{ id, lib }].
function conditions(code) {
  return (K.parCode[code] || []).filter((i) => STATUTS.indexOf(i) === -1)
    .sort((a, b) => (freqCond[a] - freqCond[b]) || (K.ordre.indexOf(a) - K.ordre.indexOf(b)))
    .map((i) => ({ id: i, lib: K.libelles[i] }));
}

module.exports = { choisir, competences, conditions, F, P, K, M, N };

if (require.main === module) {
  ['Maçon', 'Agent d\'accueil', 'Boulanger', 'Aide-soignant', 'Développeur informatique', 'Cuisinier', 'Électricien'].forEach((n) => {
    const f = M.baseMetiers.find((x) => x.nom === n); if (!f) { console.log('?', n); return; }
    console.log(n + ' (' + f.rome + ') : ' + choisir(f.rome, 3).join(' / ') + '  |  ' + conditions(f.rome).slice(0, 3).map((x) => x.lib).join(' / '));
  });
}
