const { test } = require('node:test');
const assert = require('node:assert/strict');
const { baseMetiers } = require('../data/metiers.js');

// Retour Denis 2026-10-01 (CQP APS rangé comme « savoir » du métier Agent de sécurité) : un titre, un diplôme, un permis ou une habilitation n'est pas
// un savoir. Il va dans Formations ou Certifications, et ne s'affiche JAMAIS sur un CV sans que la personne l'ait dit. Les savoirs d'un métier
// sont des connaissances (une réglementation, une méthode, un vocabulaire) ; le garde-fou ci-dessous empêche d'y remettre un titre.
const TITRE = /\b(CQP|SSIAP|SST|CACES|BAFA|BAFD|BNSSA|PSC1|AFGSU|FIMO|FCO|Certiphyto|permis\s+[a-e]\b|habilitation|dipl[oô]me|titre professionnel|carte professionnelle|CAP|BEP|BTS|DUT|licence|master)\b/i;

test('aucun métier ne range un titre, un diplôme, un permis ou une habilitation parmi ses savoirs', () => {
  const fautifs = [];
  baseMetiers.forEach((m) => { (m.savoirs || []).forEach((s) => { if (TITRE.test(s)) { fautifs.push(m.nom + ' : ' + s); } }); });
  assert.deepEqual(fautifs, []);
});

test('Agent de sécurité garde ses vrais savoirs, sans le CQP APS', () => {
  const m = baseMetiers.find((x) => x.id === 'agent_securite');
  assert.ok(m);
  assert.ok(m.savoirs.indexOf('Consignes incendie') !== -1);
  assert.ok(m.savoirs.every((s) => !/CQP/i.test(s)));
});
