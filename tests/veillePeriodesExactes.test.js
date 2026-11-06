const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Les prompts de l'outil de veille donnent TOUJOURS des dates exactes (« du 01/10/2026 au 31/10/2026 inclus »), jamais seulement un nom de mois :
// un assistant qui ne sait pas de quel jour à quel jour chercher répond « période non définie » (essai de Denis, 01/11/2026).
const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
function fn(nom) {
  const i = html.indexOf('function ' + nom + '('); assert.ok(i >= 0, nom);
  const j = html.indexOf('\n  function ', i + 10), k = html.indexOf('\n  /*', i + 10);
  const fin = [j, k].filter((x) => x > 0).sort((a, b) => a - b)[0];
  return html.slice(i, fin);
}
const NL = String.fromCharCode(10);
const corps = ['jourIso', 'bornesPeriode', 'phrasePeriode', 'phraseDepuisJours', 'dateFr'].map(fn).join(NL);
const F = new Function(corps + NL + 'function moisFr(ym) { return ym; }' + NL + 'return { jourIso: jourIso, bornesPeriode: bornesPeriode, phrasePeriode: phrasePeriode, phraseDepuisJours: phraseDepuisJours };')();

test('bornes d\'un mois et d\'un trimestre : premier et dernier jour, année bissextile comprise', () => {
  assert.deepStrictEqual(F.bornesPeriode({ mois: true, an: 2026, m1: 10 }), { debut: '2026-10-01', fin: '2026-10-31' });
  assert.deepStrictEqual(F.bornesPeriode({ mois: true, an: 2028, m1: 2 }), { debut: '2028-02-01', fin: '2028-02-29' });
  assert.deepStrictEqual(F.bornesPeriode({ q: 3, an: 2026, m1: 7 }), { debut: '2026-07-01', fin: '2026-09-30' });
  assert.deepStrictEqual(F.bornesPeriode({ q: 4, an: 2026, m1: 10 }), { debut: '2026-10-01', fin: '2026-12-31' });
});

test('la phrase de période garde le libellé ET donne les deux dates en français', () => {
  assert.strictEqual(F.phrasePeriode('octobre 2026', { mois: true, an: 2026, m1: 10 }), '« octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus)');
  assert.strictEqual(F.phrasePeriode('juillet à septembre 2026', { q: 3, an: 2026, m1: 7 }), '« juillet à septembre 2026 » (du 01/07/2026 au 30/09/2026 inclus)');
});

test('les 7 derniers jours comptent aujourd\'hui : sept jours en tout', () => {
  const m = /^du (\d{2})\/(\d{2})\/(\d{4}) au (\d{2})\/(\d{2})\/(\d{4}) inclus$/.exec(F.phraseDepuisJours(7)); assert.ok(m);
  const d = new Date(+m[3], +m[2] - 1, +m[1]), f = new Date(+m[6], +m[5] - 1, +m[4]);
  assert.strictEqual(Math.round((f - d) / 86400000), 6);
});

test('le jour courant est celui de l\'ordinateur (jamais l\'heure universelle) et les prompts utilisent les dates exactes', () => {
  assert.ok(!/function jourCourant\(\)[^\n]*toISOString/.test(html), 'jourCourant ne passe plus par toISOString');
  assert.ok(!/function moisCourant\(\)[^\n]*toISOString/.test(html), 'moisCourant non plus');
  assert.strictEqual(F.jourIso(new Date(2026, 10, 1, 0, 30)), '2026-11-01');
  ['phrasePeriode(periode, balInfoCourant().info)', 'Trimestre de référence : " + phrasePeriode(periode, b.info)', 'sur le trimestre " + phrasePeriode(periode, b.info)', 'phraseDepuisJours(7)', 'phraseDepuisJours(365)']
    .forEach((t) => assert.ok(html.includes(t), t));
});

test('une période saisie sans année (« APP ») est ignorée partout : le libellé calculé reprend', () => {
  assert.ok(/function periodeSaisie\(id\)[^\n]*\[0-9\]\{4\}/.test(html));
  assert.ok(html.includes("var per = periodeSaisie('lexPeriode');"));
});
