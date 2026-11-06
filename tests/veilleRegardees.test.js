/* Le repère « Regardée sans résultat clair » (outils/veilleRegardees.js) : lecture du fichier, annotation des cartes, et contrôle du vrai fichier outils/sas/deja-regardees.txt. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const reg = require('../outils/veilleRegardees.js');

test('lire accepte les commentaires et les remarques qui contiennent « | », refuse une ligne illisible', () => {
  const r = reg.lire('# commentaire\n\nabc-87 | 2026-11-05 | une remarque | avec barre\nxyz-24 | 2026-11-04\n');
  assert.equal(r.ok, true);
  assert.equal(r.lignes.length, 2);
  assert.equal(r.lignes[0].remarque, 'une remarque | avec barre');
  assert.equal(r.lignes[1].remarque, '');
  assert.equal(reg.lire('Mauvais Id | 2026-11-05 | x').ok, false);
  assert.equal(reg.lire('abc | 05/11/2026 | x').ok, false);
  assert.equal(reg.lire('abc').ok, false);
});

test('annoter ajoute le repère aux seules cartes listées, et ne plante pas sur un fichier illisible', () => {
  const cartes = [{ id: 'abc-87' }, { id: 'autre-24' }];
  const r = reg.annoter(cartes, 'abc-87 | 2026-11-05 | vu\n');
  assert.deepEqual(r, { ok: true, annotees: 1 });
  assert.deepEqual(cartes[0].regardee, { date: '2026-11-05', remarque: 'vu' });
  assert.equal(cartes[1].regardee, undefined);
  assert.equal(reg.annoter([{ id: 'abc-87' }], 'n importe quoi').ok, false);
});

test('le vrai fichier des fiches déjà regardées est lisible et sans identifiant en double', () => {
  const t = fs.readFileSync(path.join(__dirname, '..', ...reg.CHEMIN), 'utf8');
  const r = reg.lire(t);
  assert.equal(r.ok, true, r.erreur);
  const vus = new Set();
  r.lignes.forEach(function (l) { assert.equal(vus.has(l.id), false, 'identifiant en double : ' + l.id); vus.add(l.id); });
});
