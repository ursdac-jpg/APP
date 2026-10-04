const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const ctx = { console: console };
ctx.window = ctx; ctx.globalThis = ctx;
ctx.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: { appendChild() {} } };
vm.createContext(ctx);
['data/metiers.js', 'data/competencesSecteurs.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f }));
const referentiel = vm.runInContext('COMPETENCES_SECTEURS', ctx);
const secteursBase = Array.from(new Set(Array.from(vm.runInContext('baseMetiers', ctx)).map((m) => m.secteur)));
const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

test('référentiel des secteurs : un secteur pour chacun de ceux de la base des métiers, et aucun secteur inconnu', () => {
  const cles = Object.keys(referentiel);
  secteursBase.forEach((s) => assert.ok(cles.indexOf(s) !== -1, 'secteur sans référentiel : ' + s));
  cles.forEach((c) => assert.ok(secteursBase.indexOf(c) !== -1, 'secteur du référentiel absent de la base : ' + c));
});

test('référentiel des secteurs : chaque secteur a assez de compétences, sans doublon interne, sans tiret long', () => {
  Object.keys(referentiel).forEach((s) => {
    const r = referentiel[s];
    assert.ok(r.savoirFaire.length >= 10, s + ' : savoir-faire trop peu nombreux');
    assert.ok(r.savoirEtre.length >= 10, s + ' : savoir-être trop peu nombreux');
    assert.ok(r.savoirs.length >= 4, s + ' : savoirs trop peu nombreux');
    ['savoirFaire', 'savoirEtre', 'savoirs'].forEach((champ) => {
      const cles = r[champ].map(norm);
      assert.strictEqual(new Set(cles).size, cles.length, s + ' : doublon dans ' + champ);
      r[champ].forEach((c) => assert.ok(c && !/[—–]/.test(c), s + ' : valeur vide ou tiret long : ' + c));
    });
    assert.ok(typeof r.titresHabilitations === 'string' && r.titresHabilitations.trim().length > 10, s + ' : ligne des titres absente ou vide');
  });
});
