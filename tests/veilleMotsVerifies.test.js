'use strict';
const test = require('node:test');
const assert = require('node:assert');
const M = require('../outils/veilleMotsVerifies.js');
const V = require('../outils/veilleVerification.js');

test('mots vérifiés : ajout, renouvellement, relecture et refus d\'un mot inconnu', () => {
  const a = M.appliquer('', [{ op: 'ajouter', id: 'rsa' }, { op: 'ajouter', id: 'cv' }], '2026-10-29', ['rsa', 'cv', 'cdi']);
  assert.strictEqual(a.ok, true);
  assert.deepStrictEqual(a.resume, { ajoutes: 2, renouveles: 0 });
  assert.deepStrictEqual(M.dates(a.texte), { rsa: '2026-10-29', cv: '2026-10-29' });
  const b = M.appliquer(a.texte, [{ op: 'ajouter', id: 'rsa' }], '2026-12-01', ['rsa', 'cv']);
  assert.deepStrictEqual(b.resume, { ajoutes: 0, renouveles: 1 });
  assert.strictEqual(M.dates(b.texte).rsa, '2026-12-01');
  assert.strictEqual(M.appliquer('', [{ op: 'ajouter', id: 'zzz' }], '2026-10-29', ['rsa']).ok, false);
  assert.strictEqual(M.appliquer('', [{ op: 'effacer', id: 'rsa' }], '2026-10-29', ['rsa']).ok, false);
  assert.strictEqual(M.appliquer('', [{ op: 'ajouter', id: 'rsa' }], 'hier', ['rsa']).ok, false);
  assert.strictEqual(M.lire('ligne bizarre').ok, false);
  assert.deepStrictEqual(M.dates('ligne bizarre'), {});
});

test('mots vérifiés : jamais, récent, à revérifier au bout de six mois', () => {
  assert.strictEqual(M.etat('', '2026-10-29'), 'jamais');
  assert.strictEqual(M.etat('2026-05-01', '2026-10-29'), 'recent');
  assert.strictEqual(M.etat('2026-04-29', '2026-10-29'), 'a-revoir');
  assert.strictEqual(M.etat('2026-04-30', '2026-10-29'), 'recent');
  assert.strictEqual(M.etat('2025-01-01', '2026-10-29'), 'a-revoir');
});

test('prompt d\'un mot du Lexique : texte, date en français, refus d\'un mot vide', () => {
  const p = V.construireMot({ id: 'rsa', titre: 'RSA', corps: 'Le revenu de solidarité active.', variantes: ['revenu de solidarité'], verifieLe: '2026-01-05' });
  assert.strictEqual(p.ok, true);
  assert.match(p.prompt, /Mot : RSA/);
  assert.match(p.prompt, /05\/01\/2026/);
  assert.match(p.prompt, /Le revenu de solidarité active\./);
  assert.match(p.prompt, /obsolète/);
  assert.ok(!/[–—]/.test(p.prompt));
  assert.match(V.construireMot({ id: 'x', titre: 'X', corps: 'a' }).prompt, /jamais/);
  assert.strictEqual(V.construireMot({ id: 'x', titre: '', corps: '' }).ok, false);
});

test('adresse du registre : prompt, correction proposée seulement si valide et différente', () => {
  const p = V.construireAdresse({ nom: 'caf-aides', adresse: 'https://www.caf.fr/aides', date: '2025-03-02', portee: 'national', fiches: ['aides-logement'] });
  assert.strictEqual(p.ok, true);
  assert.match(p.prompt, /Adresse actuelle : https:\/\/www\.caf\.fr\/aides/);
  assert.match(p.prompt, /02\/03\/2025/);
  assert.ok(!/[\u2013\u2014]/.test(p.prompt));
  assert.strictEqual(V.construireAdresse({ nom: 'x', adresse: 'ftp://a' }).ok, false);
  const l = V.lireAdresse('adresse | corrigé | https://www.caf.fr/aides | page déplacée | https://www.caf.fr/nouvelle | Nouvelle page', 'https://www.caf.fr/aides');
  assert.strictEqual(l.lignes[0].statut, 'corrigé');
  assert.strictEqual(l.lignes[0].valeur, 'https://www.caf.fr/nouvelle');
  assert.strictEqual(l.lignes[0].peutMettre, true);
  const m = V.lireAdresse('adresse | corrigé | x | y | https://www.caf.fr/aides | z', 'https://www.caf.fr/aides');
  assert.strictEqual(m.lignes[0].statut, 'confirmé');
  assert.strictEqual(m.lignes[0].peutMettre, false);
  const o = V.lireAdresse('adresse | obsolète | x | supprimée | https://www.caf.fr/info | z', 'https://www.caf.fr/aides');
  assert.strictEqual(o.lignes[0].peutMettre, false);
});

test('chiffre : prompt avec les valeurs de l\'écran, date en français, refus d\'un chiffre sans valeur', () => {
  const p = V.construireChiffre({ nom: 'digest.md : Chômage : France', valeurs: { 'Valeur affichée': '7,4 %', 'Période': '2e trimestre 2026', 'Source': 'INSEE https://www.insee.fr' }, verifieLe: '2026-07-10' });
  assert.strictEqual(p.ok, true);
  assert.match(p.prompt, /10\/07\/2026/);
  assert.match(p.prompt, /- Valeur affichée : 7,4 %/);
  assert.match(p.prompt, /obsolète/);
  assert.ok(!/[\u2013\u2014]/.test(p.prompt));
  assert.strictEqual(V.construireChiffre({ nom: 'x', valeurs: { a: '' } }).ok, false);
  assert.strictEqual(V.lireFiche('Valeur affichée | confirmé | 7,4 % | 7,4 % (T2 2026) | https://www.insee.fr/p | ok').lignes[0].statut, 'confirmé');
});
