const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Carte « Inflation » (tâche C.4, maquette validée par Denis le 10/11/2026) : flèches colorées, ligne « il y a un an »,
// sous-postes de l'alimentation, suivi dans le temps. Les séries viennent de donnees/smic-inflation.json (source unique).
require('./_domStub').installerStubDom();

const M = require('../modules/comprendre-les-chiffres/index.js');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '../modules/comprendre-les-chiffres/donnees/smic-inflation.json'), 'utf8'));
const I = D.inflation;
const ETAT = { smicAJour: true, inflationAJour: true };
const clone = (o) => JSON.parse(JSON.stringify(o));

test('inflation : le sens d\'un chiffre se lit au dixième de point près (hausse, baisse, stable)', () => {
  assert.equal(M._comprendreLesChiffresInflationSens(3.4, 3.1), 'hausse');
  assert.equal(M._comprendreLesChiffresInflationSens(1.2, 1.4), 'baisse');
  assert.equal(M._comprendreLesChiffresInflationSens(3.3, 3.3), 'stable');
  assert.equal(M._comprendreLesChiffresInflationSens(0.30000000000000004, 0.3), 'stable');
  assert.equal(M._comprendreLesChiffresInflationSens(-0.2, -0.3), 'hausse');
  assert.equal(M._comprendreLesChiffresInflationSens(1, undefined), null);
});

test('inflation : mois d\'une série (début + décalage), y compris à cheval sur une année', () => {
  assert.equal(M._comprendreLesChiffresInflationMoisPlus('2017-01', 0), '2017-01');
  assert.equal(M._comprendreLesChiffresInflationMoisPlus('2017-01', 12), '2018-01');
  assert.equal(M._comprendreLesChiffresInflationMoisPlus('2025-11', 2), '2026-01');
  assert.equal(M._comprendreLesChiffresInflationMoisPlus('2017-01', 117), '2026-10');
  assert.equal(M._comprendreLesChiffresInflationMoisPlus('n’importe quoi', 3), '');
});

test('données : la série mensuelle est cohérente avec le dernier mois, le mois d\'avant et il y a un an', () => {
  const s = I.serie_sur_un_an, v = s.valeurs, n = v.length;
  assert.ok(n >= 61, 'au moins 5 ans de recul');
  assert.equal(M._comprendreLesChiffresInflationMoisPlus(s.debut, n - 1), I.dernier.mois, 'la série finit au dernier mois');
  assert.equal(v[n - 1], I.dernier.sur_un_an);
  assert.equal(M._comprendreLesChiffresInflationMoisPlus(s.debut, n - 2), I.precedent.mois);
  assert.equal(v[n - 2], I.precedent.sur_un_an);
  assert.equal(M._comprendreLesChiffresInflationMoisPlus(s.debut, n - 13), I.il_y_a_un_an.mois, 'il y a un an = 12 mois avant');
  assert.equal(v[n - 13], I.il_y_a_un_an.sur_un_an);
  v.forEach((x) => assert.ok(typeof x === 'number' && x > -3 && x < 15));
});

test('données : chaque poste affiché existe pour le mois, le mois d\'avant et il y a un an', () => {
  ['sur_un_an', 'energie', 'alimentation', 'produits_frais', 'autre_alimentation', 'services', 'produits_manufactures', 'tabac'].forEach((cle) => {
    ['dernier', 'precedent', 'il_y_a_un_an'].forEach((q) => assert.equal(typeof I[q][cle], 'number', q + ' : ' + cle));
  });
});

test('phrase sous le chiffre : le rythme comparé au mois d\'avant et à l\'an dernier, sans jamais se tromper de sens', () => {
  const faire = (l, p, a) => { const x = clone(I); x.dernier.sur_un_an = l; x.precedent.sur_un_an = p; x.il_y_a_un_an.sur_un_an = a; return M._comprendreLesChiffresInflationPhrase(x); };
  assert.equal(faire(3.4, 3.1, 0.9), 'Sur un an, les prix montent plus vite qu’en septembre et plus vite qu’il y a un an.');
  assert.equal(faire(2.0, 2.5, 4.0), 'Sur un an, les prix montent moins vite qu’en septembre et moins vite qu’il y a un an.');
  assert.equal(faire(2.0, 1.5, 4.0), 'Sur un an, les prix montent plus vite qu’en septembre, mais moins vite qu’il y a un an.');
  assert.equal(faire(2.0, 2.0, 2.0), 'Sur un an, les prix montent au même rythme qu’en septembre et au même rythme qu’il y a un an.');
  assert.equal(faire(-0.4, 0.2, 1.0), 'Sur un an, les prix baissent.');
});

test('carte : tous les postes, flèches rouge et verte avec leur mot, sous-postes de l\'alimentation, chaque chiffre sourcé', () => {
  const h = M._comprendreLesChiffresRenduCarteInflation(D, ETAT);
  ['Ensemble des prix', 'Énergie', 'Alimentation', 'dont produits frais', 'dont autre alimentation', 'Services', 'Produits manufacturés', 'Tabac'].forEach((nom) => assert.ok(h.indexOf(nom) !== -1, nom));
  assert.equal((h.match(/<tr( class="sous")?><td class="nom">/g) || []).length, 8, 'huit lignes');
  assert.equal((h.match(/<tr class="sous">/g) || []).length, 2, 'deux sous-postes');
  assert.ok(h.includes('comprendre-les-chiffres-sens-fl--hausse') && h.includes('comprendre-les-chiffres-sens-fl--baisse') && h.includes('comprendre-les-chiffres-sens-fl--stable'));
  assert.ok(h.includes('comprendre-les-chiffres-sens--hausse'), 'pastille du chiffre principal en rouge');
  // le mot accompagne toujours la flèche
  (h.match(/<span class="comprendre-les-chiffres-sens-fl[^>]*>[^<]*<\/span>/g) || []).forEach((t) => assert.match(t, /en hausse|en baisse|stable/));
  // chaque chiffre porte sa source ; aucun tiret long
  const chiffres = h.match(/<span class="chiffre"/g) || [], sources = h.match(/<span class="chiffre" data-source="[^"]+"/g) || [];
  assert.ok(chiffres.length >= 30);
  assert.equal(chiffres.length, sources.length);
  assert.ok(!new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']').test(h));
  assert.ok(h.includes('Il y a un an (octobre 2025)'));
  assert.ok(h.includes('8,0 %') && h.includes('-2,2 %'), 'produits frais : octobre 2026 et octobre 2025');
});

test('carte : le suivi dans le temps propose 12 mois, 5 ans et depuis janvier 2017, un graphique chacun', () => {
  const h = M._comprendreLesChiffresRenduCarteInflation(D, ETAT);
  assert.equal((h.match(/data-panneau-duree="/g) || []).length, 3);
  assert.ok(h.includes('12 derniers mois') && h.includes('>5 ans<') && h.includes('Depuis janvier 2017'));
  assert.equal((h.match(/<svg class="comprendre-les-chiffres-inflation-graphe"/g) || []).length, 3);
  assert.ok(h.includes('data-valeurs="' + I.serie_sur_un_an.valeurs.slice(-12).join(',') + '"'));
  assert.equal((h.match(/data-panneau-duree="\d+" hidden/g) || []).length, 2, 'seule la première durée est visible au départ');
  assert.ok(h.includes('role="img"') && h.includes('aria-label="Hausse des prix sur un an, mois par mois'));
});

test('carte : une série qui ne finit pas au bon mois (ou trop courte) ne montre aucun graphique, jamais un chiffre approximé', () => {
  const faux = clone(D); faux.inflation.serie_sur_un_an.debut = '2017-02';
  assert.ok(!M._comprendreLesChiffresRenduCarteInflation(faux, ETAT).includes('inflation-graphe'));
  const court = clone(D); court.inflation.serie_sur_un_an.valeurs = court.inflation.serie_sur_un_an.valeurs.slice(-6); court.inflation.serie_sur_un_an.debut = '2026-05';
  assert.ok(!M._comprendreLesChiffresRenduCarteInflation(court, ETAT).includes('inflation-graphe'));
  const sans = clone(D); delete sans.inflation.serie_sur_un_an;
  const h = M._comprendreLesChiffresRenduCarteInflation(sans, ETAT);
  assert.ok(!h.includes('inflation-graphe') && h.includes('3,4 %'));
});

test('carte : sans « il y a un an » ni mois d\'avant par poste, la carte reste lisible', () => {
  const x = clone(D); delete x.inflation.il_y_a_un_an;
  const h = M._comprendreLesChiffresRenduCarteInflation(x, ETAT);
  assert.ok(h.includes('Ensemble des prix') && !h.includes('Il y a un an (octobre'));
});
