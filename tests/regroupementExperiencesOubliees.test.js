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
['data/metiers.js', 'modules/cv-composeur/composeurMoteur.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f }));

const exp = (poste, entreprise) => ({ poste, entreprise, lieu: '', dateDebut: '2010', dateFin: '2012', missions: 'Mission ' + poste, contrat: '', competencesDemontrees: [] });
const objetCV = { experiences: [exp('Auxiliaire de vie sociale', 'ADMR'), exp('Agent de service hospitalier', 'Centre hospitalier'), exp('Employée de restauration collective', 'Sodexo'), exp('Accompagnement de personnes âgées voisines', '')], experiencesPersonnelles: [] };
const reg = {
  experiencesRetenues: [{ type: 'professionnelle', poste: 'Auxiliaire de vie sociale', entreprise: 'ADMR', missions: ['m1'] }, { type: 'professionnelle', poste: 'Agent de service hospitalier', entreprise: 'Centre hospitalier', missions: ['m2'] }],
  groupes: [{ metiers: ['Employée de restauration collective - Sodexo'], texteRegroupe: 'Restauration collective' }]
};

test('regroupement : une expérience que l\'assistant n\'a pas classée n\'est plus perdue (elle est gardée telle quelle, sans doublon)', () => {
  const r = ctx.composeurAppliquerRegroupementExperiences(objetCV, reg);
  const postes = Array.from(r.experiences.map((e) => e.poste));
  assert.ok(postes.indexOf('Accompagnement de personnes âgées voisines') !== -1, 'expérience oubliée disparue : ' + postes.join(' | '));
  assert.strictEqual(postes.filter((p) => /restauration/i.test(p)).length, 1, 'l\'expérience groupée ne doit apparaître qu\'une fois');
  assert.strictEqual(postes.filter((p) => /Auxiliaire de vie/i.test(p)).length, 1);
  assert.strictEqual(postes.length, 4);
});

test('regroupement : une expérience retenue sans missions dans la réponse reprend les missions déjà décidées pour cette expérience (cv.md ne les redemande plus)', () => {
  const reg2 = {
    experiencesRetenues: [{ type: 'professionnelle', poste: 'Auxiliaire de vie sociale', entreprise: 'ADMR', nombreMissionsSuggere: 5, missions: [] }],
    groupes: []
  };
  const r = ctx.composeurAppliquerRegroupementExperiences(objetCV, reg2);
  const retenue = Array.from(r.experiences).filter((e) => e.poste === 'Auxiliaire de vie sociale')[0];
  assert.ok(retenue, 'expérience retenue absente');
  assert.strictEqual(retenue.missions, 'Mission Auxiliaire de vie sociale', 'les missions réelles doivent être reprises');
  // et quand l'assistant en donne, ce sont les siennes qui servent
  const reg3 = { experiencesRetenues: [{ type: 'professionnelle', poste: 'Auxiliaire de vie sociale', entreprise: 'ADMR', missions: ['m1', 'm2'] }], groupes: [] };
  const r3 = ctx.composeurAppliquerRegroupementExperiences(objetCV, reg3);
  assert.strictEqual(Array.from(r3.experiences).filter((e) => e.poste === 'Auxiliaire de vie sociale')[0].missions, 'm1' + String.fromCharCode(10) + 'm2');
});
