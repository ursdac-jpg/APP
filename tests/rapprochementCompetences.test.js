// Rapprochement des formulations de CV avec les libellés des fiches (consigne 410, 16/11/2026).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../data/metiers.js');
const { RAPPROCHEMENT_COMPETENCES: R } = require('../data/rapprochementCompetences.js');

const libellesDeFiches = new Set();
M.baseMetiers.forEach((m) => ['savoirFaire', 'savoirEtre'].forEach((c) => (m[c] || []).forEach((x) => libellesDeFiches.add(x))));

test('chaque groupe est un libellé de fiche existant', () => {
  const inconnus = Object.keys(R).filter((g) => !libellesDeFiches.has(g));
  assert.deepStrictEqual(inconnus, [], 'groupes qui ne sont pas des libellés de fiche : ' + inconnus.join(', '));
});

test('chaque libellé de fiche (savoir-faire et savoir-être) est atteint par au moins un groupe', () => {
  const sansGroupe = [...libellesDeFiches].filter((l) => M.competencesProches(l).length === 0);
  assert.deepStrictEqual(sansGroupe, [], 'libellés sans groupe : ' + sansGroupe.join(', '));
});

test('les formulations courantes d’un CV retrouvent les fiches', () => {
  const attendus = {
    'Gestion de caisse': 'Vente', 'Préparation de commandes': 'Logistique', 'Utilisation de Word et Excel': 'Bureautique',
    'Travail en équipe': 'Esprit d\'équipe', 'Entraide': 'Esprit d\'équipe', 'Polyvalence': 'Adaptabilité', 'Nettoyage': 'Entretien',
    'Mise en rayon': 'Merchandising', 'Gestes de premiers secours': 'Secourisme', 'Rapidité': 'Réactivité', 'Règles d\'hygiène': 'Hygiène'
  };
  Object.keys(attendus).forEach((phrase) => {
    const cible = attendus[phrase];
    assert.ok(M.correspondCompetence(phrase, cible), '« ' + phrase + ' » doit correspondre à « ' + cible + ' »');
  });
});

test('l’apostrophe typographique d’un CV est la même que l’apostrophe droite', () => {
  assert.strictEqual(M.normaliserTexte('Esprit d’équipe'), M.normaliserTexte('Esprit d\'équipe'));
  assert.ok(M.correspondCompetence('Soins d’hygiène', 'Soins'));
});

test('prudence : une formulation inconnue ou un mot isolé ne rapproche rien à tort', () => {
  assert.deepStrictEqual(M.competencesProches('Stabilité émotionnelle exemplaire'), []);
  assert.ok(!M.correspondCompetence('Dressage de chiens', 'Cuisine'), 'dressage de chiens n’est pas de la cuisine');
  assert.ok(!M.correspondCompetence('Pâtisserie', 'Soins aux animaux'));
  assert.ok(!M.correspondCompetence('Soins infirmiers', 'Épilation'));
});

test('une compétence reconnue que la fiche ne cite pas retire un point, une compétence inconnue ne retire rien', () => {
  const fiche = M.baseMetiers.filter((m) => m.nom === 'Cariste')[0];
  const base = { niveauPersonne: 5, actions: fiche.actions.slice(), activites: fiche.activites.slice(), environnement: fiche.environnement.slice(), savoirFaire: fiche.savoirFaire.slice(), savoirEtre: fiche.savoirEtre.slice(), savoirs: [] };
  const de = (p) => M.rechercherMetiers(p, 5000).filter((m) => m.nom === 'Cariste')[0];
  const reference = de(base);
  const inconnue = de(Object.assign({}, base, { savoirFaire: base.savoirFaire.concat(['Stabilité émotionnelle exemplaire']) }));
  assert.strictEqual(inconnue.contresens, reference.contresens, 'formulation inconnue : aucun contresens');
  const reconnue = de(Object.assign({}, base, { savoirFaire: base.savoirFaire.concat(['Maquillage artistique']) }));
  assert.strictEqual(reconnue.contresens, reference.contresens + 1, 'formulation reconnue mais absente de la fiche : un contresens');
});

test('le fichier de rapprochement est chargé avant le moteur et ne contient aucun tiret long', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.indexOf('<script src="data/rapprochementCompetences.js"') !== -1 && html.indexOf('<script src="data/rapprochementCompetences.js"') < html.indexOf('<script src="data/metiers.js"'));
  const src = fs.readFileSync(path.join(__dirname, '..', 'data', 'rapprochementCompetences.js'), 'utf8');
  assert.ok(!/[\u2014\u2013]/.test(src), 'tiret cadratin ou demi-cadratin trouvé');
});

test('une formulation de CV pèse comme le libellé de fiche auquel elle correspond (jamais comme un élément « ultra rare »)', () => {
  const profil = (sf) => ({ actions: [], activites: [], environnement: [], savoirFaire: sf, savoirEtre: [], savoirs: [] });
  const de = (sf) => M.rechercherMetiers(profil(sf), 5000).filter((m) => m.nom === 'Cariste')[0];
  const libelle = de(['Logistique', 'Manutention']);
  const formulations = de(['Préparation de commandes', 'Chargement']);
  assert.ok(libelle && formulations, 'Cariste doit être trouvé dans les deux cas');
  assert.strictEqual(formulations.scoreExact, libelle.scoreExact, 'même poids pour la formulation et pour son libellé');
});

test('profil de cuisinier fait de compétences seules : aucune fiche sans rapport avec la cuisine devant le Cuisinier', () => {
  const profil = { actions: [], activites: [], environnement: [], savoirs: [],
    savoirFaire: ['Préparation de commandes', 'Gestion de caisse', 'Entraide', 'Rapidité', "Règles d'hygiène", 'Cuisine', 'Service en salle'], savoirEtre: ['Travail en équipe', 'Polyvalence'] };
  const noms = M.rechercherMetiers(profil, 5000).map((m) => m.nom);
  const rang = noms.indexOf('Cuisinier / Commis de cuisine');
  assert.ok(rang !== -1 && rang <= 2, 'le Cuisinier doit être dans les 3 premiers, rang trouvé : ' + rang);
  ['Courtier affrètement maritime', 'Pêcheur sous-marin'].forEach((n) => assert.ok(noms.indexOf(n) === -1 || noms.indexOf(n) > rang, n + ' ne doit pas passer devant le Cuisinier'));
});
