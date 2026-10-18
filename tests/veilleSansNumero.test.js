'use strict';
const test = require('node:test');
const assert = require('node:assert');
const S = require('../outils/veilleSansNumero.js');

test('sans numéro : lecture, ajout daté, renouvellement, fiche inconnue refusée, ligne illisible refusée', () => {
  const ids = { lieux: ['caf-24'], employeurs: ['u-1'] };
  const a = S.appliquer(S.ENTETE.join('\n') + '\n', [{ op: 'ajouter', registre: 'lieux', id: 'caf-24' }], '2026-10-18', ids);
  assert.ok(a.ok); assert.deepStrictEqual(a.resume, { ajoutes: 1, renouveles: 0 });
  assert.deepStrictEqual(S.confirmations(a.texte), { 'lieux:caf-24': '2026-10-18' });
  const b = S.appliquer(a.texte, [{ op: 'ajouter', registre: 'lieux', id: 'caf-24' }], '2027-04-20', ids);
  assert.deepStrictEqual(b.resume, { ajoutes: 0, renouveles: 1 });
  assert.deepStrictEqual(S.confirmations(b.texte), { 'lieux:caf-24': '2027-04-20' });
  assert.strictEqual(S.appliquer(a.texte, [{ op: 'ajouter', registre: 'lieux', id: 'inconnu' }], '2026-10-18', ids).ok, false);
  assert.strictEqual(S.appliquer(a.texte, [{ op: 'retirer', registre: 'lieux', id: 'caf-24' }], '2026-10-18', ids).ok, false);
  assert.strictEqual(S.appliquer('lieux | x', [], '2026-10-18', ids).ok, false);
});

test('sans numéro : une confirmation vaut moins de six mois', () => {
  assert.strictEqual(S.estValable('2026-10-18', '2027-04-17'), true);
  assert.strictEqual(S.estValable('2026-10-18', '2027-04-18'), false);
  assert.strictEqual(S.estValable('', '2027-04-18'), false);
});

test('sans numéro : les cartes sont les fiches publiées sans numéro, hors proposées et hors confirmées récemment', () => {
  const T = require('../outils/veilleTerritoire.js');
  const l = (id, tel) => { const v = { id: id, type: 'association', nom: 'N ' + id, description: 'd', commune: 'Périgueux', zone: '', telephone: tel, site: '', source: '', date: '2026-10-01' }; return T.formater(T.FICHIERS.lieux.colonnes, v); };
  const registres = { lieux: [l('a', ''), l('b', '05 53 00 00 00'), l('c', ''), l('d', '')].join('\n'), employeurs: '' };
  const cartes = S.cartesSansNumero(registres, 'lieux | c | 2026-09-01', '2026-10-18', ['d']);
  assert.deepStrictEqual(cartes.map((x) => x.valeurs.cible), ['a']);
  assert.strictEqual(cartes[0].generee, true);
  assert.strictEqual(S.cartesSansNumero(registres, 'lieux | c | 2026-03-01', '2026-10-18', ['d']).length, 2, 'confirmation de plus de six mois : la fiche revient');
});
