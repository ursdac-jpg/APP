const { test } = require('node:test');
const assert = require('node:assert/strict');
const { COMPETENCES_ROME } = require('../data/competencesRome.js');
const { PHRASES_MACROS } = require('../scripts/importRome/phrasesMacros.js');
const { baseMetiers } = require('../data/metiers.js');

// Deux codes du ROME 62 (C1129, C1216) n'ont aucune compétence décrite par France Travail : pas de phrase pour eux, ce n'est pas un oubli de l'import.
const SANS_COMPETENCE_DANS_LE_ROME = ['C1129', 'C1216'];

// Phase 4, étape 2 : « ce que fait ce métier », les 489 macro-compétences du ROME en phrases simples, rattachées à la fiche par son code ROME.

test('chaque macro-compétence du ROME a sa phrase simple, bien formée, sans tiret long ni mot « IA »', () => {
  assert.equal(COMPETENCES_ROME.phrases.length, 489);
  assert.equal(Object.keys(PHRASES_MACROS).length, 489);
  COMPETENCES_ROME.phrases.forEach((p) => {
    assert.ok(typeof p === 'string' && p.length >= 5 && p.length <= 90, 'longueur : ' + p);
    assert.ok(/^[A-ZÀÂÉÈÊÎÔÛ]/.test(p) && !/[.;:]$/.test(p), 'forme : ' + p);
    assert.ok(!/[—–]|\s-\s|\bIA\b/.test(p), 'tiret long ou IA : ' + p);
  });
});

test('les phrases sont toutes différentes entre elles', () => {
  assert.equal(new Set(COMPETENCES_ROME.phrases).size, COMPETENCES_ROME.phrases.length);
});

test('chaque code du ROME a des phrases, avec des numéros valides, sans répétition, et chaque phrase a un objectif', () => {
  const codes = Object.keys(COMPETENCES_ROME.parCode);
  assert.ok(codes.length >= 1900);
  codes.forEach((c) => {
    const ids = COMPETENCES_ROME.parCode[c];
    if (SANS_COMPETENCE_DANS_LE_ROME.indexOf(c) === -1) { assert.ok(ids.length >= 1, c + ' sans phrase'); }
    assert.equal(new Set(ids).size, ids.length, c + ' phrase répétée');
    ids.forEach((i) => { assert.ok(Number.isInteger(i) && i >= 0 && i < 489, c + ' numéro invalide ' + i); });
  });
  assert.equal(COMPETENCES_ROME.objectifs.length, 489);
});

test('toute fiche de métier qui a un code ROME retrouve ses phrases (fiches à la main, générées et alias)', () => {
  const sans = baseMetiers.filter((m) => m.rome && !COMPETENCES_ROME.parCode[m.rome]).map((m) => m.id + ' ' + m.rome);
  assert.deepEqual(sans, []);
});
