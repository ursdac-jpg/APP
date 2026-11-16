'use strict';
/* ============================================================
   scripts/mesurePourcentageMetiers.js
   Mesure du « pourcentage de cohérence » des métiers proposés dans « Votre profil » (consigne 410, 16/11/2026).
   Lecture seule : ne modifie rien. Lancer : node scripts/mesurePourcentageMetiers.js
   Profils FICTIFS construits comme le fait l'application : les compétences de la personne sont DÉDUITES de ses choix
   (actions, activités, environnement) par les catalogues, comme deduireCompetences() (js/app.js).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const racine = path.join(__dirname, '..');
['data/actionsProfessionnelles.js', 'data/personnesMaterielsLieux.js', 'data/environnementsTravail.js'].forEach((f) => {
  vm.runInThisContext(fs.readFileSync(path.join(racine, f), 'utf8'), { filename: f });
});
const M = require('../data/metiers.js');
const { rechercherMetiers, baseMetiers, normaliserTexte, correspond } = M;
const ACTIONS = vm.runInThisContext('CATALOGUE_ACTIONS_PRO');
const LIEUX = vm.runInThisContext('CATALOGUE_PERSONNES_MATERIELS_LIEUX');
const ENVS = vm.runInThisContext('CATALOGUE_ENVIRONNEMENTS_TRAVAIL');
const tous = (cat) => [].concat(...cat.map((g) => g.items));
const itemsA = tous(ACTIONS), itemsL = tous(LIEUX), itemsE = tous(ENVS);
const trouver = (items, id) => items.filter((i) => i.id === id)[0];
const chercher = (items, re) => items.filter((i) => re.test(i.id) || re.test(i.label)).map((i) => i.id);

function profilDepuisChoix(c, avecCompetences) {
  // Depuis la consigne 410 : les compétences déduites des choix sont séparées de celles écrites dans le CV (elles comptent à petit poids).
  const sf = [], se = [], sfd = [], sed = [];
  const ajouter = (l, cible) => (l || []).forEach((x) => { if (cible.indexOf(x) === -1) { cible.push(x); } });
  if (avecCompetences) {
    (c.actions || []).forEach((id) => { const r = trouver(itemsA, id); if (r) { ajouter(r.savoirFaire, sfd); ajouter(r.savoirEtre, sed); } });
    (c.activites || []).forEach((id) => { const r = trouver(itemsL, id); if (r) { ajouter(r.savoirFaire, sfd); ajouter(r.savoirEtre, sed); } });
    (c.environnement || []).forEach((id) => { const r = trouver(itemsE, id); if (r) { ajouter(r.savoirFaire, sfd); ajouter(r.savoirEtre, sed); } });
  }
  ajouter(c.sfCV, sf); ajouter(c.seCV, se);
  return { activites: c.activites || [], actions: c.actions || [], environnement: c.environnement || [], valeurs: [], savoirFaire: sf, savoirEtre: se, savoirFaireDeduits: sfd.filter((x) => sf.indexOf(x) === -1), savoirEtreDeduits: sed.filter((x) => se.indexOf(x) === -1), savoirs: [], niveauPersonne: 2 };
}
const top = (p, n) => rechercherMetiers(p, n || 10);
const noms = (l) => l.map((m) => m.nom);
const recouvrement = (a, b) => { const s = new Set(noms(b)); return noms(a).filter((x) => s.has(x)).length; };

const PROFILS = [
  { titre: 'Cuisine et service', actions: ['cuisiner', 'servir'].concat(chercher(itemsA, /^nettoyer$/)), activites: ['clients', 'collegues', 'aliments'], environnement: chercher(itemsE, /restaur|cuisine/i).slice(0, 1) },
  { titre: 'Logistique', actions: ['transporter', 'organiser'].concat(chercher(itemsA, /gerer_stocks/)), activites: ['marchandises', 'machines', 'vehicules'], environnement: chercher(itemsE, /entrep|logist/i).slice(0, 1) },
  { titre: 'Aide à la personne', actions: ['soigner'].concat(chercher(itemsA, /accompagn/).slice(0, 1), ['conseiller']), activites: ['personnes_agees', 'familles'], environnement: chercher(itemsE, /domicile/i).slice(0, 1) },
  { titre: 'Bureau', actions: ['saisir', 'classer', 'communiquer_ecrit'], activites: ['ordinateur', 'documents'], environnement: chercher(itemsE, /bureau/i).slice(0, 1) },
  { titre: 'Vente', actions: ['vendre', 'conseiller'].concat(chercher(itemsA, /accueill/).slice(0, 1)), activites: ['clients'], environnement: chercher(itemsE, /magasin|commerce/i).slice(0, 1) },
  { titre: 'Bâtiment', actions: ['construire', 'reparer'].filter((id) => trouver(itemsA, id)), activites: ['outils', 'materiaux'], environnement: chercher(itemsE, /chantier|ext/i).slice(0, 1) },
  { titre: 'Une seule action très répandue (organiser)', actions: ['organiser'], activites: [], environnement: [] },
  { titre: 'CV importé, sans choix : compétences seulement', actions: [], activites: [], environnement: [], sfCV: ['Conduite de chariot élévateur', 'Préparation de commandes', 'Gestion des stocks'], seCV: ['Rigueur', 'Endurance'] }
];

console.log('=== A. Profils types : les 10 premiers et la forme des pourcentages ===');
PROFILS.forEach((c) => {
  const p = profilDepuisChoix(c, true);
  const t = top(p, 10);
  const tout = baseMetiers.map((m) => ({ nom: m.nom, score: M.rechercherMetiers ? 0 : 0 }));
  const nbPositifs = rechercherMetiers(p, 5000).length;
  const scores = t.map((m) => m.score);
  const exaequo = scores.filter((s) => s === scores[0]).length;
  console.log('\n' + c.titre + ' | choix : ' + p.actions.length + ' actions, ' + p.activites.length + ' activités, ' + p.environnement.length + ' env., ' + (p.savoirFaire.length + p.savoirEtre.length) + ' compétences déduites');
  console.log('  métiers avec un score > 0 : ' + nbPositifs + ' sur ' + baseMetiers.length + ' | score n°1 : ' + scores[0] + ' %, n°10 : ' + scores[scores.length - 1] + ' % | ex æquo au sommet : ' + exaequo);
  t.forEach((m, i) => console.log('  ' + (i + 1) + '. ' + m.score + ' % ' + m.nom + ' (' + m.secteur + ')'));
});

console.log('\n=== B. Que change chaque critère ? (recouvrement des 10 premiers avec le profil complet) ===');
PROFILS.slice(0, 6).forEach((c) => {
  const complet = top(profilDepuisChoix(c, true));
  const sansComp = top(profilDepuisChoix(c, false));
  const sansEnv = top(profilDepuisChoix(Object.assign({}, c, { environnement: [] }), true));
  const sansAct = top(profilDepuisChoix(Object.assign({}, c, { activites: [] }), true));
  const sansActions = top(profilDepuisChoix(Object.assign({}, c, { actions: [] }), true));
  console.log(c.titre + ' : sans les compétences déduites ' + recouvrement(complet, sansComp) + '/10 | sans l\'environnement ' + recouvrement(complet, sansEnv) + '/10 | sans les activités ' + recouvrement(complet, sansAct) + '/10 | sans les actions ' + recouvrement(complet, sansActions) + '/10');
});

console.log('\n=== C. Que vaut le pourcentage affiché ? (300 profils tirés au hasard : 2 à 3 actions, 2 lieux ou publics) ===');
let graine = 7;
const alea = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
const piocher = (l, n) => { const c = l.slice(), r = []; while (r.length < n && c.length) { r.push(c.splice(Math.floor(alea() * c.length), 1)[0]); } return r; };
const premiers = [], dixiemes = [], hauts = [], ecarts = [];
for (let i = 0; i < 300; i++) {
  const c = { actions: piocher(itemsA.map((x) => x.id), 2 + Math.floor(alea() * 2)), activites: piocher(itemsL.map((x) => x.id), 2), environnement: [] };
  const t = top(profilDepuisChoix(c, true), 10);
  if (t.length < 10) { continue; }
  premiers.push(t[0].score); dixiemes.push(t[9].score);
  hauts.push(t.filter((m) => m.score >= 90).length); ecarts.push(t[0].score - t[9].score);
}
const med = (l) => l.slice().sort((a, b) => a - b)[Math.floor(l.length / 2)];
console.log('profils retenus : ' + premiers.length + ' | score du n°1 : médiane ' + med(premiers) + ' % | score du n°10 : médiane ' + med(dixiemes) + ' % | écart n°1 à n°10 : médiane ' + med(ecarts) + ' points');
console.log('nombre de métiers à 90 % ou plus parmi les 10 premiers : médiane ' + med(hauts) + ' | profils dont les 10 premiers sont tous à 90 % ou plus : ' + hauts.filter((h) => h === 10).length);
const dist = { '100': 0, '90-99': 0, '70-89': 0, '50-69': 0, '< 50': 0 };
premiers.forEach((s) => { if (s >= 100) { dist['100']++; } else if (s >= 90) { dist['90-99']++; } else if (s >= 70) { dist['70-89']++; } else if (s >= 50) { dist['50-69']++; } else { dist['< 50']++; } });
console.log('répartition du score du n°1 : ' + JSON.stringify(dist));

console.log('\n=== D. Vocabulaire : les compétences de la personne retrouvent-elles celles des fiches ? ===');
const vocFiches = new Set();
baseMetiers.forEach((m) => [].concat(m.savoirFaire || [], m.savoirEtre || [], m.savoirs || []).forEach((x) => vocFiches.add(normaliserTexte(x))));
const compCatalogues = new Set();
[itemsA, itemsL, itemsE].forEach((items) => items.forEach((i) => [].concat(i.savoirFaire || [], i.savoirEtre || []).forEach((x) => compCatalogues.add(x))));
const listeFiches = Array.from(vocFiches);
const retrouvee = (c) => baseMetiers.some((m) => [].concat(m.savoirFaire || [], m.savoirEtre || []).some((x) => correspond(c, x)));
let ok = 0, ko = [];
compCatalogues.forEach((c) => { if (retrouvee(c)) { ok++; } else { ko.push(c); } });
console.log('compétences proposées par les catalogues de choix : ' + compCatalogues.size + ' | retrouvées dans au moins une fiche : ' + ok + ' | jamais retrouvées : ' + ko.length + (ko.length ? ' (' + ko.slice(0, 12).join(', ') + ')' : ''));
const phrasesCV = ['Gestion de caisse', 'Accueil clientèle', 'Préparation de commandes', 'Entretien des locaux', 'Travail en équipe', 'Respect des consignes de sécurité', 'Utilisation de Word et Excel', 'Conduite de chariot élévateur', 'Service en salle', 'Mise en rayon', 'Relation client', 'Cuisine', 'Rigueur', 'Polyvalence', 'Sens du service', 'Manutention', 'Nettoyage', 'Bricolage', 'Soins d’hygiène', 'Écoute'];
console.log('phrases typiques d’un CV importé :');
phrasesCV.forEach((c) => {
  const n = baseMetiers.filter((m) => [].concat(m.savoirFaire || [], m.savoirEtre || [], m.savoirs || []).some((x) => correspond(c, x))).length;
  console.log('  ' + (n ? String(n).padStart(4) : '   0') + ' fiches  « ' + c + ' »');
});

console.log('\n=== E. Ce que le calcul ignore ===');
console.log('fiches avec des valeurs : ' + baseMetiers.filter((m) => (m.valeurs || []).length).length + ' sur ' + baseMetiers.length + ' (les valeurs ne comptent déjà plus)');
console.log('fiches avec un environnement : ' + baseMetiers.filter((m) => (m.environnement || []).length).length + ' | avec des activités : ' + baseMetiers.filter((m) => (m.activites || []).length).length + ' | avec des actions : ' + baseMetiers.filter((m) => (m.actions || []).length).length);
console.log('poids : activités 25, actions 25, savoir-faire 20, savoir-être 15, savoirs 10, environnement et valeurs 5 (total 100)');
