// Pertinence des suggestions de métiers (consigne 263, 13/11/2026) : rareté, rang, niveau de diplôme, expérience, doublons.
// Règles voulues par Denis : aucun métier n'est retiré ; sans diplôme saisi, jamais de métier de Bac+5 ou de docteur en tête ;
// l'expérience dans le domaine remonte un métier et réduit l'écart de diplôme ; une même profession n'apparaît qu'une fois.
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../data/metiers.js');
const { METIERS_ROME_NIVEAUX } = require('../data/metiersRome.js');
const { niveauDepuisTexte, niveauAcces } = require('../scripts/importRome/niveauxAcces.js');

const SOIN = { actions: ['soigner', 'accompagner'], activites: ['personnes_agees'] };
const parNom = (liste, nom) => liste.findIndex((m) => m.nom === nom);

test('niveau d\'accès lu dans le texte du ROME : le plus bas niveau cité, titres professionnels compris', () => {
  assert.equal(niveauDepuisTexte('Ce métier est accessible avec un diplôme allant du niveau Bac à Bac+3 dans le domaine du social.'), 4);
  assert.equal(niveauDepuisTexte('Un titre professionnel de niveau 5 est demandé.'), 5);
  assert.equal(niveauDepuisTexte('Accessible avec un CAP ou un BEP.'), 3);
  assert.equal(niveauDepuisTexte('Un Doctorat en odontologie.'), 8);
  assert.equal(niveauDepuisTexte('Une expérience professionnelle est appréciée.'), null);
  assert.equal(niveauAcces({ acces: 'Il est accessible sans diplôme, avec de l\'expérience.', libelle: 'Vente', appellations: [] }), 2);
  assert.equal(niveauAcces({ acces: '', libelle: 'Soins médicaux', appellations: [{ libelle: 'Gériatre' }] }), 8);
  assert.equal(niveauAcces({ acces: 'Rien de précis.', libelle: 'Soins', appellations: [{ libelle: 'Aide-soignant' }] }), 4);
  assert.equal(niveauAcces({ acces: 'Rien de précis.', libelle: 'Inconnu', appellations: [] }), null);
});

test('les niveaux d\'accès générés sont dans l\'échelle 2 à 8 et couvrent les métiers évidents', () => {
  const valeurs = Object.keys(METIERS_ROME_NIVEAUX).map((c) => METIERS_ROME_NIVEAUX[c]);
  assert.ok(valeurs.length > 1000, 'niveaux connus : ' + valeurs.length);
  assert.ok(valeurs.every((n) => Number.isInteger(n) && n >= 2 && n <= 8));
  const g = M.baseMetiers.find((m) => m.nom === 'Gériatre');
  const a = M.baseMetiers.find((m) => m.nom === 'Aide-soignant');
  assert.equal(M.niveauAccesMetier(g), 8);
  assert.equal(M.niveauAccesMetier(a), 4);
});

test('niveau de la personne : formations saisies (libellés, niveau chiffré, titre professionnel), 2 si rien', () => {
  assert.equal(M.niveauPersonneDepuisFormations([]), 2);
  assert.equal(M.niveauPersonneDepuisFormations(undefined), 2);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'CAP / BEP' }]), 3);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'Bac' }]), 4);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'Bac +2' }]), 5);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'Titre professionnel niveau 5' }]), 5);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'Titre professionnel niveau 4' }, { niveau: 'CAP / BEP' }]), 4);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'Bac +3 / Bac +4' }]), 6);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'Bac +5' }]), 7);
  assert.equal(M.niveauPersonneDepuisFormations([{ niveau: 'x', niveauRNCP: 6 }]), 6);
});

test('sans diplôme saisi, aucun métier de Bac+5 ou de docteur dans les 5 premiers ; avec un Bac+5, ils reviennent', () => {
  const sans = M.rechercherMetiers(Object.assign({ niveauPersonne: 2 }, SOIN), 5);
  assert.ok(sans.every((m) => { const n = M.niveauAccesMetier(m); return n === null || n < 7; }), 'trop de diplôme en tête : ' + sans.map((m) => m.nom).join(', '));
  const haut = M.rechercherMetiers(Object.assign({ niveauPersonne: 7 }, SOIN), 8);
  assert.ok(parNom(haut, 'Gériatre') !== -1 || parNom(haut, 'Gérontologue') !== -1, 'un Bac+5 revoit les métiers de Bac+5');
});

test('le niveau ne retire jamais un métier : il ne fait que le descendre', () => {
  const tous = (profil) => M.rechercherMetiers(profil, 5000).map((m) => m.id).sort();
  assert.deepEqual(tous(Object.assign({ niveauPersonne: 2 }, SOIN)), tous(SOIN));
});

test('sans niveau dans le profil (Découverte, recherche), le classement ne tient pas compte du diplôme', () => {
  const sans = M.rechercherMetiers(SOIN, 10).map((m) => m.nom + m.score);
  const avec8 = M.rechercherMetiers(Object.assign({ niveauPersonne: 8 }, SOIN), 10).map((m) => m.nom + m.score);
  assert.deepEqual(sans, avec8);
});

test('l\'expérience dans le domaine remonte un métier et réduit l\'écart de diplôme', () => {
  const exp = M.experienceDepuisPostes([{ poste: 'Aide-soignant', dateDebut: '2015', dateFin: '2022' }], 2026);
  assert.deepEqual(exp.codes, ['J1501']);
  assert.equal(exp.annees, 7);
  const sans = M.rechercherMetiers(Object.assign({ niveauPersonne: 2 }, SOIN), 20);
  const avec = M.rechercherMetiers(Object.assign({ niveauPersonne: 2, experience: exp }, SOIN), 20);
  const score = (l, nom) => (l.find((m) => m.nom === nom) || { score: 0 }).score;
  assert.ok(score(avec, 'Infirmier') > score(sans, 'Infirmier'), 'infirmier remonte avec 7 ans d\'aide-soignant');
  assert.ok(score(avec, 'Aide-soignant') >= score(sans, 'Aide-soignant'));
});

test('une expérience sans rapport ne fait apparaître aucun métier nouveau', () => {
  const exp = M.experienceDepuisPostes([{ poste: 'Aide-soignant', dateDebut: '2010', dateFin: '2020' }], 2026);
  const profil = { actions: ['reparer'], activites: ['machines'], niveauPersonne: 2 };
  const sans = M.rechercherMetiers(profil, 5000).map((m) => m.id).sort();
  const avec = M.rechercherMetiers(Object.assign({ experience: exp }, profil), 5000).map((m) => m.id).sort();
  assert.deepEqual(avec, sans);
});

test('une même profession n\'apparaît qu\'une fois dans les propositions (sigle ignoré)', () => {
  const cle = (nom) => M.normaliserTexte(String(nom).replace(/\([^)]*\)/g, '')).replace(/[^a-z0-9]/g, '');
  [SOIN, { actions: ['vendre', 'conseiller'], activites: ['clients'] }, { actions: ['reparer'], activites: ['machines'] }].forEach((p) => {
    const l = M.rechercherMetiers(Object.assign({ niveauPersonne: 4 }, p), 30).map((m) => cle(m.nom));
    assert.equal(new Set(l).size, l.length);
  });
});

test('les scores restent entre 1 et 100', () => {
  const exp = M.experienceDepuisPostes([{ poste: 'Aide-soignant', dateDebut: '2000', dateFin: '' }], 2026);
  M.rechercherMetiers(Object.assign({ niveauPersonne: 8, experience: exp }, SOIN), 5000).forEach((m) => assert.ok(m.score >= 1 && m.score <= 100, m.nom + ' ' + m.score));
});

test('un poste qui n\'est le nom d\'aucune fiche est retrouvé dans le répertoire élargi du ROME, seulement s\'il est chargé', () => {
  const fs = require('node:fs');
  const poste = [{ poste: 'Zingueur industriel', dateDebut: '2015', dateFin: '2020' }];
  assert.deepEqual(M.experienceDepuisPostes(poste, 2026).codes, [], 'sans répertoire chargé, rien n\'est deviné');
  globalThis.REPERTOIRE_ROME = new Function(fs.readFileSync(require('node:path').join(__dirname, '..', 'data', 'repertoireRome.js'), 'utf8') + ';return REPERTOIRE_ROME;')();
  try {
    const exp = M.experienceDepuisPostes(poste, 2026);
    assert.deepEqual(exp.codes, ['H3410']);
    assert.deepEqual(exp.domaines, ['H34']);
    assert.ok(exp.secteurs.length === 1 && exp.secteurs[0].length > 3);
    assert.deepEqual(M.experienceDepuisPostes([{ poste: 'Chef de projet galactique', dateDebut: '2015', dateFin: '2020' }], 2026).codes, [], 'un poste inconnu ne donne rien');
  } finally { delete globalThis.REPERTOIRE_ROME; }
});

test('niveaux d\'accès lus sur MétierScope : dans l\'échelle 2 à 8, en complément du ROME qui passe toujours avant', () => {
  const { METIERS_ROME_NIVEAUX_VERIFIES } = require('../data/niveauxAccesVerifies.js');
  const codes = Object.keys(METIERS_ROME_NIVEAUX_VERIFIES);
  assert.ok(codes.length > 500, 'niveaux vérifiés : ' + codes.length);
  assert.ok(codes.every((c) => /^[A-N]\d{4}$/.test(c) && Number.isInteger(METIERS_ROME_NIVEAUX_VERIFIES[c]) && METIERS_ROME_NIVEAUX_VERIFIES[c] >= 2 && METIERS_ROME_NIVEAUX_VERIFIES[c] <= 8));
  // un code sans niveau dans le ROME prend le niveau vérifié ; un code avec niveau dans le ROME garde le sien
  const sansRome = codes.find((c) => METIERS_ROME_NIVEAUX[c] === undefined);
  assert.equal(M.niveauAccesMetier({ rome: sansRome }), METIERS_ROME_NIVEAUX_VERIFIES[sansRome]);
  const avecRome = Object.keys(METIERS_ROME_NIVEAUX)[0];
  assert.equal(M.niveauAccesMetier({ rome: avecRome }), METIERS_ROME_NIVEAUX[avecRome]);
  assert.equal(M.niveauAccesMetier({ rome: 'Z9999' }), null);
});
