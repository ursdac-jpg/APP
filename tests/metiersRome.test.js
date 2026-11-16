const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { baseMetiers, baseMetiersDetaillees, rechercherMetiers, SECTEURS_APP } = require('../data/metiers.js');
const { categorieCompetence } = require('../data/competences.js');
const { METIERS_ROME, METIERS_ROME_ALIAS } = require('../data/metiersRome.js');

// data/metiersRome.js est GÉNÉRÉ (node scripts/importRome/genererMetiersRome.js) : ces tests vérifient qu'il reste cohérent avec la base à la main et
// avec les catalogues de choix. Si un identifiant de catalogue change, ce test échoue : régénérer le fichier (consigne 263).
const ctx = {}; vm.createContext(ctx);
['actionsProfessionnelles', 'personnesMaterielsLieux', 'environnementsTravail'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', f + '.js'), 'utf8') + ';', ctx));
const ids = (nom) => new Set(vm.runInContext(nom, ctx).reduce((a, g) => a.concat(g.items.map((i) => i.id)), []));
const ACTIONS = ids('CATALOGUE_ACTIONS_PRO'), MATIERES_PUBLICS = ids('CATALOGUE_PERSONNES_MATERIELS_LIEUX'), LIEUX = ids('CATALOGUE_ENVIRONNEMENTS_TRAVAIL');
const SECTEURS = SECTEURS_APP.map((s) => s.libelle);
const TITRE = /\b(CQP|SSIAP|SST|CACES|BAFA|BAFD|BNSSA|PSC1|AFGSU|FIMO|FCO|Certiphyto|permis\s+[a-e]\b|habilitation|dipl[oô]me|titre professionnel|carte professionnelle|CAP|BEP|BTS|DUT|licence|master)\b/i;

test('les fiches du ROME sont nombreuses, de niveau rome, avec un identifiant et un nom uniques', () => {
  assert.ok(METIERS_ROME.length > 1700, 'au moins 1700 fiches générées, trouvé ' + METIERS_ROME.length);
  const idsVus = new Set(), nomsVus = new Set(baseMetiersDetaillees.map((m) => m.nom.toLowerCase())), fautifs = [];
  METIERS_ROME.forEach((m) => {
    if (m.niveau !== 'rome' || m.id !== 'rome_' + m.rome || idsVus.has(m.id) || nomsVus.has(m.nom.toLowerCase())) { fautifs.push(m.id + ' ' + m.nom); }
    idsVus.add(m.id); nomsVus.add(m.nom.toLowerCase());
  });
  assert.deepEqual(fautifs, []);
});

test('un code du ROME n\'est jamais à la fois détaillé à la main et généré (une seule source par métier)', () => {
  const detailles = new Set(baseMetiersDetaillees.map((m) => m.rome));
  assert.deepEqual(METIERS_ROME.filter((m) => detailles.has(m.rome)).map((m) => m.rome), []);
});

test('chaque fiche du ROME est rangée dans un secteur de la liste contrôlée', () => {
  assert.deepEqual(METIERS_ROME.filter((m) => SECTEURS.indexOf(m.secteur) === -1).map((m) => m.id), []);
});

test('les listes des fiches du ROME n\'emploient que le vocabulaire de l\'application', () => {
  const mauvais = [];
  METIERS_ROME.forEach((m) => {
    m.activites.forEach((i) => { if (!MATIERES_PUBLICS.has(i)) { mauvais.push(m.id + ' activité ' + i); } });
    m.actions.forEach((i) => { if (!ACTIONS.has(i)) { mauvais.push(m.id + ' action ' + i); } });
    m.environnement.forEach((i) => { if (!LIEUX.has(i)) { mauvais.push(m.id + ' lieu ' + i); } });
    m.savoirFaire.concat(m.savoirEtre).forEach((t) => { if (!categorieCompetence[t]) { mauvais.push(m.id + ' compétence ' + t); } });
  });
  assert.deepEqual(mauvais.slice(0, 10), []);
});

test('aucune fiche du ROME ne range un titre, un diplôme, un permis ou une habilitation parmi ses savoirs', () => {
  const fautifs = [];
  METIERS_ROME.forEach((m) => m.savoirs.forEach((s) => { if (TITRE.test(s)) { fautifs.push(m.nom + ' : ' + s); } }));
  assert.deepEqual(fautifs.slice(0, 10), []);
});

test('les plafonds de listes sont respectés (une fiche générée ne doit pas écraser une fiche détaillée au score)', () => {
  const hors = METIERS_ROME.filter((m) => m.actions.length > 6 || m.environnement.length > 3 || m.savoirFaire.length > 6 || m.savoirEtre.length > 4 || m.savoirs.length > 6 || m.activites.length > 6);
  assert.deepEqual(hors.map((m) => m.id), []);
});

test('les alias pointent vers une fiche qui existe', () => {
  const tousIds = new Set(baseMetiers.map((m) => m.id));
  assert.deepEqual(Object.keys(METIERS_ROME_ALIAS).filter((c) => !tousIds.has(METIERS_ROME_ALIAS[c])), []);
});

// ---- Branchement dans la base unique (phase 2, consigne 263)
test('baseMetiers = les fiches détaillées puis toutes les fiches du ROME, chacune avec son niveau', () => {
  assert.equal(baseMetiersDetaillees.length, 135);
  assert.equal(baseMetiers.length, baseMetiersDetaillees.length + METIERS_ROME.length);
  assert.ok(baseMetiersDetaillees.every((m) => m.niveau === 'detaillee'));
  assert.ok(baseMetiers.slice(0, 135).every((m) => m.niveau === 'detaillee'), 'les fiches détaillées passent toujours en premier');
  assert.ok(baseMetiers.slice(135).every((m) => m.niveau === 'rome'));
});

test('les 139 fiches détaillées restent trouvées dans les 5 premières avec leurs propres choix (zéro régression)', () => {
  const perdus = [];
  baseMetiersDetaillees.forEach((m) => {
    const r = rechercherMetiers({ activites: m.activites, actions: m.actions, environnement: m.environnement, savoirFaire: m.savoirFaire, savoirEtre: m.savoirEtre, savoirs: m.savoirs }, 5);
    if (!r.some((x) => x.id === m.id)) { perdus.push(m.nom); }
  });
  assert.deepEqual(perdus, []);
});

test('à score égal, aucune fiche ne reçoit d’avantage : ordre alphabétique des noms', () => {
  const { comparerMetiersParScore } = require('../data/metiers.js');
  const tri = [{ id: 'r', nom: 'Zèbre', score: 50, niveau: 'rome' }, { id: 'd', nom: 'Poney', score: 50, niveau: 'detaillee' }, { id: 'x', nom: 'Abeille', score: 50, niveau: 'rome' }, { id: 'h', nom: 'Yack', score: 60, niveau: 'rome' }].sort(comparerMetiersParScore).map((x) => x.id);
  assert.deepEqual(tri, ['h', 'x', 'd', 'r']);
});

test('un métier choisi dans le répertoire élargi retrouve sa fiche par son code du ROME (fiche détaillée, générée ou alias)', () => {
  const { enregistrerCodeRomeIntitule, ficheDeIntituleChoisi, ficheParCodeRome } = require('../data/metiers.js');
  const g = METIERS_ROME[0];
  assert.equal(ficheParCodeRome(g.rome).id, g.id);
  const alias = Object.keys(METIERS_ROME_ALIAS)[0];
  assert.equal(ficheParCodeRome(alias).id, METIERS_ROME_ALIAS[alias]);
  enregistrerCodeRomeIntitule('Intitulé de test', g.rome);
  assert.equal(ficheDeIntituleChoisi('intitule de test').id, g.id);
  assert.equal(ficheDeIntituleChoisi('Inconnu'), null);
});

test('metierParNom retrouve la fiche d\'un intitulé choisi dans le répertoire élargi, et une fiche générée par son nom', () => {
  const { enregistrerCodeRomeIntitule } = require('../data/metiers.js');
  const vm2 = require('vm');
  // metierParNom n'est pas exporté : on le charge avec le fichier, comme le navigateur
  const ctx2 = {}; vm2.createContext(ctx2);
  vm2.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'metiersRome.js'), 'utf8') + ';' + fs.readFileSync(path.join(__dirname, '..', 'data', 'metiers.js'), 'utf8') + ';', ctx2);
  const g = METIERS_ROME.find((m) => m.nom === 'Bûcheron');
  assert.equal(vm2.runInContext("metierParNom('Bûcheron')", ctx2).id, g.id, 'une fiche générée se retrouve par son nom');
  assert.equal(vm2.runInContext("metierParNom('Intitulé inventé du répertoire')", ctx2), null);
  vm2.runInContext("enregistrerCodeRomeIntitule('Intitulé inventé du répertoire', '" + g.rome + "')", ctx2);
  assert.equal(vm2.runInContext("metierParNom('Intitulé inventé du répertoire')", ctx2).id, g.id, 'le code du ROME mène à la fiche');
});

test('« À savoir sur ce métier » : conditions générées cohérentes (identifiants connus, phrases sans tiret long, codes du ROME connus)', () => {
  const { CONDITIONS_ROME } = require('../data/conditionsRome.js');
  const connus = new Set(CONDITIONS_ROME.ordre);
  assert.deepEqual(Object.keys(CONDITIONS_ROME.libelles).sort(), CONDITIONS_ROME.ordre.slice().sort());
  Object.keys(CONDITIONS_ROME.libelles).forEach((id) => { assert.ok(!/[—–]/.test(CONDITIONS_ROME.libelles[id]), 'tiret long dans ' + id); });
  const codesBase = new Set(baseMetiers.map((m) => m.rome));
  const inconnus = [];
  Object.keys(CONDITIONS_ROME.parCode).forEach((c) => { CONDITIONS_ROME.parCode[c].forEach((id) => { if (!connus.has(id)) { inconnus.push(c + ' ' + id); } }); });
  assert.deepEqual(inconnus, []);
  assert.ok(METIERS_ROME.filter((m) => CONDITIONS_ROME.parCode[m.rome]).length > 1500, 'la plupart des fiches générées ont au moins une condition');
  assert.ok(Object.keys(CONDITIONS_ROME.parCode).filter((c) => codesBase.has(c)).length > 1500);
});

// Garde-fou (leçon 9.156) : aucun choix d'une fiche ne doit viser un identifiant qui n'existe pas dans les catalogues proposés à la personne,
// sinon la fiche est notée sur un choix que personne ne peut cocher. Vaut pour les fiches à la main comme pour les fiches générées.
test('tous les choix de toutes les fiches existent dans les catalogues proposés', () => {
  const morts = [];
  baseMetiers.forEach((m) => {
    (m.actions || []).forEach((x) => { if (!ACTIONS.has(x)) { morts.push(m.id + ' action ' + x); } });
    (m.activites || []).forEach((x) => { if (!MATIERES_PUBLICS.has(x)) { morts.push(m.id + ' activité ' + x); } });
    (m.environnement || []).forEach((x) => { if (!LIEUX.has(x)) { morts.push(m.id + ' lieu ' + x); } });
  });
  assert.deepEqual(morts, []);
});

// Garde-fou (consigne 280, 13/11/2026) : chaque métier de la base offre au moins un choix dans chacune des trois questions du parcours
// (avec qui ou quoi, actions, lieux), sinon aucune personne ne peut le retrouver en cochant cette question.
test('chaque fiche offre au moins un choix dans les trois questions du parcours', () => {
  const vides = [];
  baseMetiers.forEach((m) => {
    if (!(m.activites || []).some((x) => MATIERES_PUBLICS.has(x))) { vides.push(m.id + ' : aucun choix avec qui ou quoi'); }
    if (!(m.actions || []).some((x) => ACTIONS.has(x))) { vides.push(m.id + ' : aucune action'); }
    if (!(m.environnement || []).some((x) => LIEUX.has(x))) { vides.push(m.id + ' : aucun lieu'); }
  });
  assert.deepEqual(vides, []);
});

test('une fiche du ROME qui a une seconde description écrite la porte comme une fiche à la main (listes écrites + signature du ROME)', () => {
  const { DESCRIPTIONS_ECRITES } = require('../data/descriptionsEcrites.js');
  const ids = Object.keys(DESCRIPTIONS_ECRITES);
  assert.ok(ids.length >= 100, 'au moins 100 descriptions écrites, trouvé ' + ids.length);
  const fautifs = [];
  ids.forEach((id) => {
    const m = baseMetiers.find((x) => x.id === id), d = DESCRIPTIONS_ECRITES[id];
    if (!m || m.niveau !== 'rome') { fautifs.push(id + ' : fiche du ROME introuvable'); return; }
    if (JSON.stringify(m.actions) !== JSON.stringify(d.actions) || JSON.stringify(m.activites) !== JSON.stringify(d.activites) || JSON.stringify(m.environnement) !== JSON.stringify(d.environnement)) { fautifs.push(id + ' : listes différentes'); }
    if (!m.signatureRome) { fautifs.push(id + ' : pas de seconde signature'); }
    ['actions', 'activites', 'environnement'].forEach((c) => { if (!d[c].length) { fautifs.push(id + ' : liste vide ' + c); } });
  });
  assert.deepEqual(fautifs, []);
});
