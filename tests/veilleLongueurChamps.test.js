const test = require('node:test');
const assert = require('node:assert');
const T = require('../outils/veilleTerritoire.js');

// Demande de Denis (04/11/2026) : la fiche Carrefour (39 magasins, 2 017 caractères) était refusée avec un message qui accusait « une barre verticale » alors qu'il s'agissait de la longueur.

test('une liste d\'établissements de 2 000 caractères est acceptée, une liste de 5 000 est refusée avec la vraie raison', () => {
  const longue = Array.from({ length: 40 }, (_, i) => 'Limoges:' + (i + 1) + ' rue de la Paix:05 55 00 00 0' + (i % 10)).join(' ; ');
  assert.ok(longue.length > 800 && longue.length < 4000);
  assert.strictEqual(T.problemeDeValeur(longue, 'etablissements'), '');
  assert.match(T.problemeDeValeur(longue.repeat(4), 'etablissements'), /trop long \(\d+ caractères, 4000 au plus\)/);
});

test('les autres champs gardent 800 caractères, la source 1 500, et la barre verticale reste refusée avec son propre message', () => {
  assert.match(T.problemeDeValeur('a'.repeat(801), 'nom'), /trop long/);
  assert.strictEqual(T.problemeDeValeur('a'.repeat(1400), 'source'), '');
  assert.match(T.problemeDeValeur('a | b', 'nom'), /barre verticale/);
  assert.match(T.problemeDeValeur('a\nb', 'nom'), /retour à la ligne/);
});
