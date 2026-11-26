// Consigne de Denis du 25/11/2026 : toute date écrite pour un humain ou pour un assistant est en français
// (jour, mois, année), jamais AAAA-MM-JJ. Ici : la phrase « Nous sommes le ... » des deux socles de recherche.
const { test } = require('node:test');
const assert = require('node:assert/strict');
require('./_domStub').installerStubDom();

const MOIS = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';
const MOTIF = new RegExp('^Nous sommes le (1er|[1-9]|[12][0-9]|3[01]) (' + MOIS + ') [0-9]{4}[.] ');

test('Socle de Comprendre le cadre : la date du jour est écrite en français', () => {
  const m = require('../modules/comprendre-le-cadre/index.js');
  const t = m._comprendreLeCadreSocleRecherche();
  assert.match(t, MOTIF);
  assert.doesNotMatch(t.slice(0, 40), /\d{4}-\d{2}-\d{2}/);
});

test('Socle de Comprendre les chiffres : la date du jour est écrite en français', () => {
  const m = require('../modules/comprendre-les-chiffres/index.js');
  const t = m.COMPRENDRE_LES_CHIFFRES_SOCLE_PROMPT;
  assert.match(t, MOTIF);
  assert.doesNotMatch(t.slice(0, 40), /\d{4}-\d{2}-\d{2}/);
});
