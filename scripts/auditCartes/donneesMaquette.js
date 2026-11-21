'use strict';
// Données RÉELLES des cartes de la maquette « cartes enrichies » (consigne 509) : trois chemins, trois métiers chacun, avec conditions de travail et compétences du ROME.
// Lecture seule. Règles essayées ici (à valider par Denis avant tout code de l'application) :
//  - compétences : celles que le ROME marque « cœur de métier », puis celles qui comptent le plus d'activités, pondérées par leur rareté dans la base (voir choixCompetences.js) ;
//  - conditions : les conditions de travail (pas les statuts : indépendant, intérim, fonction publique, alternance), les plus RARES d'abord, car ce sont celles qui distinguent un métier d'un autre.
// Lancer depuis la racine du dépôt : node scripts/auditCartes/donneesMaquette.js (écrit donneesMaquette.data.js, lu par la maquette)
const fs = require('fs'), path = require('path');
const { M, L, C, pmdDonnees, CAT } = require('../auditAtteignabilite/commun.js');
const { choisir, conditions } = require('./choixCompetences.js');
const LR = require('../../data/lettresRiasecRome.js').LETTRES_RIASEC_ROME;

function fiche(nom) { return M.baseMetiers.find((x) => x.nom === nom); }
function commun(nom, extra) {
  const f = fiche(nom); if (!f) { throw new Error('métier absent : ' + nom); }
  return Object.assign({
    nom: f.nom, secteur: f.secteur, rome: f.rome, acces: L.cmlLibelleNiveauAcces(L.cmlNiveauDeMetier(f)),
    lettres: LR[f.rome] || '', conditions: conditions(f.rome), competences: choisir(f.rome, 6)
  }, extra || {});
}

const out = { chemin1: [], chemin2: [], chemin3: [] };

// Chemin 2 : une personne qui pense à la cuisine et au service, six choix.
const profil2 = ['aliments', 'cuisiner', 'cuisine', 'clients', 'servir', 'nettoyer'];
const catDe = {}; [CAT.activites, CAT.actions, CAT.environnement].forEach((c, k) => c.forEach((g) => g.items.forEach((it) => { catDe[it.id] = ['activites', 'actions', 'environnement'][k]; })));
const choix2 = { activites: [], actions: [], environnement: [] }; profil2.forEach((id) => choix2[catDe[id]].push(id));
const liste2 = L.cmlEntree2Metiers(choix2, 5000);
out.chemin2 = liste2.slice(0, 3).map((m) => commun(m.nom, { pct: Math.round(m.score), retrouves: m.choixRetrouves, choix: profil2.length }));
out.chemin2.n = profil2.length;

// Chemin 1 : une personne qui pense à « Aide-soignant » : six compétences de sa fiche.
const D = pmdDonnees();
const r = D.m.find((x) => x[0] === 'Aide-soignant'), sf = r[3].slice(0, 6), t = sf.map((i) => ({ t: 'sf', i }));
const S = C.pmcEtatInitial(); S.comp = t; const R = C.pmcCalculer(D, S);
out.chemin1 = R.retenus.slice(0, 3).map((o) => commun(D.m[o.i][0], { pct: Math.round(o.sc.pct), retrouves: o.sc.retrouvees, choix: t.length }));

// Chemin 3 : un résultat « Social, Artistique, Entreprenant ».
out.chemin3 = L.cmlMetiersPourLettres(['S', 'A', 'E']).slice(0, 3).map((x) => commun(x.metier.nom, { lettresMetier: x.lettres || '' }));

const sortie = path.join(__dirname, 'donneesMaquette.data.js');
const entete = '// Généré par donneesMaquette.js (consigne 509) : données réelles de la maquette des cartes enrichies.' + String.fromCharCode(10);
fs.writeFileSync(sortie, entete + 'var DONNEES = ' + JSON.stringify({ chemin1: out.chemin1, chemin2: out.chemin2, chemin3: out.chemin3 }) + ';' + String.fromCharCode(10));
console.log('écrit : ' + sortie);
