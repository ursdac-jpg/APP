const { test } = require('node:test');
const assert = require('node:assert/strict');

// Lignes de disponibilité et d'horaires proposées au CV (E6, 24/10/2026).
const { lignesDisponibiliteCv } = require('../modules/cv-core/disponibiliteCv.js');

test('rien d’indiqué : aucune ligne', () => {
  assert.deepEqual(lignesDisponibiliteCv({}), []);
  assert.deepEqual(lignesDisponibiliteCv(null), []);
  assert.deepEqual(lignesDisponibiliteCv({ objectif: 'offre', offre: { dispo: [] }, horaires: [] }), []);
});

test('disponibilité immédiate lue dans l’objectif choisi', () => {
  const d = { objectif: 'spontanee', offre: { dispo: ['Sous 15 jours'] }, spontanee: { dispo: ['Immédiatement'] } };
  assert.deepEqual(lignesDisponibiliteCv(d), ['Disponible immédiatement']);
});

test('« Sans préférence » ne donne aucune ligne', () => {
  assert.deepEqual(lignesDisponibiliteCv({ objectif: 'offre', offre: { dispo: ['Sans préférence'] } }), []);
});

test('tous les horaires : « prêt à accepter tout type d’horaire »', () => {
  const horaires = ['Journée', 'Tôt le matin', 'Soirée', 'Week-end', 'Jours fériés', 'Nuit', 'Horaires fractionnés (avec une coupure)'];
  assert.deepEqual(lignesDisponibiliteCv({ horaires }), ['Prêt à accepter tout type d’horaire']);
});

test('horaires décalés : liste lisible, la journée seule ne dit rien', () => {
  assert.deepEqual(lignesDisponibiliteCv({ horaires: ['Journée'] }), []);
  assert.deepEqual(lignesDisponibiliteCv({ horaires: ['Journée', 'Soirée', 'Week-end'] }), ['Horaires adaptables : en soirée, le week-end']);
});

test('disponibilité et horaires ensemble, sans tiret long', () => {
  const l = lignesDisponibiliteCv({ objectif: 'offre', offre: { dispo: ['Immédiatement'] }, horaires: ['Nuit'] });
  assert.equal(l.length, 2);
  assert.ok(!/[—–]/.test(l.join(' ')));
});
