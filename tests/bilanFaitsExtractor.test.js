const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  BILAN_DETECTEURS_FAITS, bilanExtraireFaits,
  bilanDetecterCoherenceDates, bilanTrouverChevauchements, bilanPeriodeIncluseDans
} = require('../modules/bilan-candidature/analyse/faitsExtractor.js');

test('bilanExtraireFaits : produit une observation par detecteur inscrit (extensibilite verifiee)', () => {
  const observations = bilanExtraireFaits({ experiencesDates: [] });
  assert.equal(observations.length, BILAN_DETECTEURS_FAITS.length);
  // TACHE (retour utilisateur : coherence anonymisation/alertes, 2026-08-10) :
  // 1 seul detecteur desormais (coherence_dates) -- bilanDetecterCoordonnees
  // retire, le CV analyse par le Bilan ne contient jamais les coordonnees
  // (voir hostDataAdapter.js), ce detecteur n'avait donc plus lieu d'etre.
  assert.equal(BILAN_DETECTEURS_FAITS.length, 1);
});

test('bilanExtraireFaits : chaque observation est bien d\'origine factuelle, avec un id', () => {
  const observations = bilanExtraireFaits({ experiencesDates: [] });
  observations.forEach((obs) => {
    assert.equal(obs.origine, 'factuelle');
    assert.match(obs.id, /^obsf-/);
  });
});

test('bilanPeriodeIncluseDans : periode entierement contenue dans une autre = inclusion', () => {
  const a = { dateDebut: 2019, dateFin: 2020 };
  const b = { dateDebut: 2018, dateFin: 2021 };
  assert.equal(bilanPeriodeIncluseDans(a, b, 2026), true);
});

test('bilanPeriodeIncluseDans : deux experiences consecutives (2020-2022 puis 2022-2024) = PAS une inclusion', () => {
  const a = { dateDebut: 2020, dateFin: 2022 };
  const b = { dateDebut: 2022, dateFin: 2024 };
  assert.equal(bilanPeriodeIncluseDans(a, b, 2026), false);
  assert.equal(bilanPeriodeIncluseDans(b, a, 2026), false);
});

test('bilanPeriodeIncluseDans : deux periodes identiques = pas signalees (postes concurrents plausibles)', () => {
  const a = { dateDebut: 2020, dateFin: 2022 };
  const b = { dateDebut: 2020, dateFin: 2022 };
  assert.equal(bilanPeriodeIncluseDans(a, b, 2026), false);
});

test('bilanPeriodeIncluseDans : experience "en cours" (dateFin null) traitee jusqu\'a l\'annee courante', () => {
  const enCours = { dateDebut: 2020, dateFin: null };
  const incluse = { dateDebut: 2021, dateFin: 2022 };
  assert.equal(bilanPeriodeIncluseDans(incluse, enCours, 2026), true);
});

test('bilanTrouverChevauchements : ne compte qu\'une fois une inclusion reelle', () => {
  const experiences = [{ dateDebut: 2019, dateFin: 2020 }, { dateDebut: 2018, dateFin: 2021 }];
  assert.equal(bilanTrouverChevauchements(experiences, 2026).length, 1);
});

test('bilanTrouverChevauchements : aucune experience => aucun chevauchement', () => {
  assert.deepEqual(bilanTrouverChevauchements([], 2026), []);
});

test('bilanDetecterCoherenceDates : formule un message different selon presence ou non de chevauchement', () => {
  const [sans] = bilanDetecterCoherenceDates({ experiencesDates: [{ dateDebut: 2020, dateFin: 2022 }, { dateDebut: 2022, dateFin: 2024 }] }, 2026);
  const [avec] = bilanDetecterCoherenceDates({ experiencesDates: [{ dateDebut: 2018, dateFin: 2021 }, { dateDebut: 2019, dateFin: 2020 }] }, 2026);
  assert.match(sans.contenu, /Aucun chevauchement/);
  assert.match(avec.contenu, /1 chevauchement/);
});
