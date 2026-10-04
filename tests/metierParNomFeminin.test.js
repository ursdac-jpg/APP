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
vm.runInContext(fs.readFileSync(path.join(racine, 'data/metiers.js'), 'utf8'), ctx, { filename: 'data/metiers.js' });
const idDe = (nom) => { const f = vm.runInContext('metierParNom(' + JSON.stringify(nom) + ')', ctx); return f ? f.id : null; };

test('metierParNom : la forme féminine retrouve la fiche écrite au masculin', () => {
  assert.equal(idDe('Assistant de vie aux familles (ADVF)'), 'advf');
  assert.equal(idDe('Assistant de vie aux familles'), 'advf');
  assert.equal(idDe('Assistante de vie aux familles'), 'advf');
  assert.equal(idDe('assistante de vie aux familles'), 'advf');
});

test('metierParNom : un intitulé inconnu reste inconnu (pas de faux rapprochement)', () => {
  assert.equal(idDe('Zorglubeuse intergalactique'), null);
  assert.equal(idDe(''), null);
});
