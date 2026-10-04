// Placement de la rubrique « Certifications » (décision de Denis, 2026-10-01) : comme Langues, colonne de gauche par défaut, déplaçable, empilable.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const contexte = {
  normaliserPourComparaison: (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-core/certifications.js', 'utf8'), contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateA4.js', 'utf8'), contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateMaquette.js', 'utf8'), contexte);
const json = (x) => JSON.parse(JSON.stringify(x));

test('« certifs » est un bloc déplaçable des deux colonnes', () => {
  assert.ok(json(contexte._PDF_BLOCS_COLONNES).includes('certifs'));
});

test('disposition de départ : Certifications dans la colonne de gauche, juste après Langues', () => {
  const d = json(contexte._pdfDispositionDepartColonnes(true, false, false));
  const gauche = d.gauche.map((l) => l[0]);
  assert.ok(gauche.includes('certifs'));
  assert.equal(gauche.indexOf('certifs'), gauche.indexOf('langues') + 1);
  assert.ok(!d.droite.some((l) => l.includes('certifs')));
});

test('une disposition enregistrée avant la rubrique reçoit Certifications dans la colonne de gauche, sans rien perdre', () => {
  const depart = contexte._pdfDispositionDepartColonnes(true, false, false);
  const ancienne = { gauche: [['pro'], ['comp'], ['langues'], ['centres']], droite: [['exp'], ['form'], ['perso']] };
  const r = json(contexte._pdfNormaliserDispositionColonnes(ancienne, depart, 35));
  const aplat = (col) => r[col].map((l) => l.join('+'));
  assert.ok(aplat('gauche').includes('certifs'));
  ['pro', 'comp', 'langues', 'centres'].forEach((k) => assert.ok(aplat('gauche').includes(k), k));
  ['exp', 'form', 'perso'].forEach((k) => assert.ok(aplat('droite').includes(k), k));
});

test('Certifications peut être placée à droite, sous les formations, ou à côté de Langues dans la colonne large', () => {
  const depart = contexte._pdfDispositionDepartColonnes(true, false, false);
  const choisie = { gauche: [['pro'], ['comp'], ['logi'], ['infos'], ['centres']], droite: [['exp'], ['form'], ['certifs', 'langues'], ['perso']] };
  const r = json(contexte._pdfNormaliserDispositionColonnes(choisie, depart, 35));
  assert.deepEqual(r.droite.find((l) => l.includes('certifs')), ['certifs', 'langues']);
});
