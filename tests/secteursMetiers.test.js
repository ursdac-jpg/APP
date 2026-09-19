const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  baseMetiers,
  SECTEURS_APP,
  METIERS_SAISONNIER_ALIMENTAIRE,
  METIERS_QUI_RECRUTENT_GENERALEMENT
} = require('../data/metiers.js');
const { SECTEURS_DETAIL } = require('../data/secteurs.js');

// Fusion 2026-09-15 : baseMetiers contient desormais directement les 129
// fiches (avant, elles etaient reparties sur 3 fichiers assembles au seul
// chargement navigateur -- data/referentielMetiersERIP.js et
// data/metiersComplementaires.js ont disparu, absorbes dans data/metiers.js).
const tousMetiers = baseMetiers;

// Chantier "Candidater depuis la recherche + secteurs", sous-lot 1 :
// `secteur` de chaque fiche est une VALEUR CONTROLEE = un libelle de SECTEURS_APP.

test('baseMetiers contient bien les 129 fiches', () => {
  assert.equal(tousMetiers.length, 129);
});

test('SECTEURS_APP : 21 entrees, cles et libelles uniques', () => {
  assert.equal(SECTEURS_APP.length, 21);
  assert.equal(new Set(SECTEURS_APP.map((s) => s.cle)).size, 21, 'cles non uniques');
  assert.equal(new Set(SECTEURS_APP.map((s) => s.libelle)).size, 21, 'libelles non uniques');
  SECTEURS_APP.forEach((s) => {
    assert.equal(typeof s.cle, 'string');
    assert.ok(s.cle.length > 0);
    assert.equal(typeof s.libelle, 'string');
    assert.ok(s.libelle.length > 0);
  });
});

test('tout <fiche>.secteur est un libelle de SECTEURS_APP', () => {
  const libs = new Set(SECTEURS_APP.map((s) => s.libelle));
  const horsListe = tousMetiers.filter((f) => !libs.has(f.secteur));
  assert.deepEqual(
    horsListe.map((f) => f.id + ' -> ' + f.secteur),
    [],
    'fiches avec un secteur hors liste controlee'
  );
});

test('chaque secteur de SECTEURS_APP a au moins 2 fiches', () => {
  const comptes = {};
  tousMetiers.forEach((f) => { comptes[f.secteur] = (comptes[f.secteur] || 0) + 1; });
  const maigres = SECTEURS_APP.filter((s) => (comptes[s.libelle] || 0) < 2);
  assert.deepEqual(maigres.map((s) => s.cle + ':' + (comptes[s.libelle] || 0)), []);
});

test('repartition conforme au plan (docs/PLAN_SECTEURS_2026-09-04.md)', () => {
  const attendu = {
    'Bâtiment et travaux publics': 13,
    'Industrie, production et énergie': 14,
    'Hôtellerie, restauration et tourisme': 13,
    'Agriculture, nature et espaces verts': 10,
    'Transport et logistique': 9,
    'Santé et soins': 8,
    'Social et services à la personne': 8,
    'Commerce et vente': 7,
    'Administration, gestion et bureau': 7,
    'Communication, culture et événementiel': 6,
    'Métiers animaliers': 5,
    'Propreté et gestion des déchets': 4,
    'Sport, animation et loisirs': 4,
    'Informatique et numérique': 3,
    'Banque, assurance et immobilier': 3,
    'Artisanat et création': 3,
    'Métiers de bouche (artisanat)': 3,
    'Éducation et formation': 3,
    'Mécanique et automobile': 2,
    'Sécurité': 2,
    'Coiffure et esthétique': 2
  };
  const comptes = {};
  tousMetiers.forEach((f) => { comptes[f.secteur] = (comptes[f.secteur] || 0) + 1; });
  assert.deepEqual(comptes, attendu);
});

test('METIERS_SAISONNIER_ALIMENTAIRE : 26 ids, tous valides', () => {
  const ids = new Set(tousMetiers.map((f) => f.id));
  assert.deepEqual(METIERS_SAISONNIER_ALIMENTAIRE.filter((i) => !ids.has(i)), []);
  assert.equal(METIERS_SAISONNIER_ALIMENTAIRE.length, 26);
  assert.equal(new Set(METIERS_SAISONNIER_ALIMENTAIRE).size, 26, 'doublons');
});

test('METIERS_QUI_RECRUTENT_GENERALEMENT : 39 ids, tous valides', () => {
  const ids = new Set(tousMetiers.map((f) => f.id));
  assert.deepEqual(METIERS_QUI_RECRUTENT_GENERALEMENT.filter((i) => !ids.has(i)), []);
  assert.equal(METIERS_QUI_RECRUTENT_GENERALEMENT.length, 39);
  assert.equal(new Set(METIERS_QUI_RECRUTENT_GENERALEMENT).size, 39, 'doublons');
});

test('les 2 listes "connaissance generale" ne se chevauchent pas', () => {
  const set = new Set(METIERS_SAISONNIER_ALIMENTAIRE);
  assert.deepEqual(METIERS_QUI_RECRUTENT_GENERALEMENT.filter((i) => set.has(i)), []);
});

// ---- Sous-lot 2 : data/secteurs.js (fiches de secteur + metiers phares) ----

test('SECTEURS_DETAIL couvre exactement les 21 cles de SECTEURS_APP', () => {
  const clesApp = SECTEURS_APP.map((s) => s.cle).sort();
  const clesDetail = SECTEURS_DETAIL.map((s) => s.cle).sort();
  assert.deepEqual(clesDetail, clesApp);
  // libelles alignes sur SECTEURS_APP
  const libParCle = {};
  SECTEURS_APP.forEach((s) => { libParCle[s.cle] = s.libelle; });
  SECTEURS_DETAIL.forEach((s) => {
    assert.equal(s.libelle, libParCle[s.cle], 'libelle desaligne pour ' + s.cle);
    assert.equal(typeof s.explication, 'string');
    assert.ok(Array.isArray(s.metiersPhares));
  });
});

test('metiersPhares de chaque secteur = exactement les ids des fiches du secteur', () => {
  const idsParLibelle = {};
  tousMetiers.forEach((f) => {
    (idsParLibelle[f.secteur] = idsParLibelle[f.secteur] || []).push(f.id);
  });
  SECTEURS_DETAIL.forEach((s) => {
    const attendus = (idsParLibelle[s.libelle] || []).slice().sort();
    const phares = s.metiersPhares.slice().sort();
    assert.deepEqual(phares, attendus, 'metiersPhares != fiches pour ' + s.cle);
    assert.equal(new Set(s.metiersPhares).size, s.metiersPhares.length, 'doublon dans metiersPhares ' + s.cle);
  });
});
