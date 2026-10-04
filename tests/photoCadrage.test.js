const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../modules/photo-cadrage/photoCadrage.js');

test('photo cadrage : etat initial = photo entiere qui remplit le cadre, centree', () => {
  const e = P.photoCadrageEtatInitial(900, 1200);
  assert.equal(P.photoCadragePourcent(e), 100);
  const r = P.photoCadrageRegion(e);
  assert.equal(Math.round(r.cote), 900);   // le carre couvre toute la largeur
  assert.equal(Math.round(r.sx) + 0, 0);
  assert.equal(Math.round(r.sy), 150);     // centre verticalement
});

test('photo cadrage : jamais de vide dans le cadre, quel que soit le deplacement', () => {
  const e = P.photoCadrageEtatInitial(900, 1200);
  P.photoCadrageDeplacer(e, 5000, 5000);
  let r = P.photoCadrageRegion(e);
  assert.ok(r.sx >= 0 && r.sy >= 0);
  P.photoCadrageDeplacer(e, -99999, -99999);
  r = P.photoCadrageRegion(e);
  assert.ok(r.sx + r.cote <= 900 + 1e-6 && r.sy + r.cote <= 1200 + 1e-6);
});

test('photo cadrage : zoom borne entre 100 % et 400 %, centre conserve', () => {
  const e = P.photoCadrageEtatInitial(1000, 1000);
  const avant = P.photoCadrageRegion(e);
  const centreX = avant.sx + avant.cote / 2;
  P.photoCadrageZoomer(e, e.kmin * 2);
  assert.equal(P.photoCadragePourcent(e), 200);
  const apres = P.photoCadrageRegion(e);
  assert.ok(Math.abs(apres.sx + apres.cote / 2 - centreX) < 1e-6);
  P.photoCadrageZoomer(e, e.kmin * 99);
  assert.equal(P.photoCadragePourcent(e), 400);
  P.photoCadrageZoomer(e, 0.0001);
  assert.equal(P.photoCadragePourcent(e), 100);
});

test('photo cadrage : alerte de flou quand la partie gardee est trop petite pour 400 points', () => {
  const e = P.photoCadrageEtatInitial(1000, 1000);
  assert.equal(P.photoCadrageEstFloue(e), false);
  P.photoCadrageZoomer(e, e.kmin * 4);          // partie gardee = 250 points
  assert.equal(P.photoCadrageEstFloue(e), true);
  const petite = P.photoCadrageEtatInitial(250, 250); // photo deja trop petite
  assert.equal(P.photoCadrageEstFloue(petite), true);
});

test('photo cadrage : restaurer un cadrage memorise, et ignorer un cadrage invalide', () => {
  const e = P.photoCadrageEtatInitial(1000, 1000);
  P.photoCadrageZoomer(e, e.kmin * 2);
  P.photoCadrageDeplacer(e, -40, -25);
  const memo = { k: e.k, ox: e.ox, oy: e.oy };
  const neuf = P.photoCadrageEtatInitial(1000, 1000);
  P.photoCadrageRestaurer(neuf, memo);
  assert.deepEqual(P.photoCadrageRegion(neuf), P.photoCadrageRegion(e));
  const intact = P.photoCadrageEtatInitial(1000, 1000);
  P.photoCadrageRestaurer(intact, { k: 'x' });
  assert.equal(P.photoCadragePourcent(intact), 100);
  // cadrage hors limites : ramene dans le cadre valide
  const hors = P.photoCadrageEtatInitial(1000, 1000);
  P.photoCadrageRestaurer(hors, { k: 9999, ox: 5000, oy: -9999 });
  assert.equal(P.photoCadragePourcent(hors), 400);
  const r = P.photoCadrageRegion(hors);
  assert.ok(r.sx >= 0 && r.sy >= 0 && r.sx + r.cote <= 1000 + 1e-6 && r.sy + r.cote <= 1000 + 1e-6);
});
