// Date d'un nom de fichier enregistré : toujours en français, jour-mois-année (décision de Denis du 25/11/2026), jamais année-mois-jour.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../modules/cv-core/dates.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');

test('dateFichierFr : jour-mois-année sur deux chiffres, avec ou sans l’heure, en heure locale', () => {
  assert.equal(D.dateFichierFr(new Date(2026, 10, 25, 9, 30)), '25-11-2026');
  assert.equal(D.dateFichierFr(new Date(2026, 10, 25, 9, 30), true), '25-11-2026-09h30');
  assert.equal(D.dateFichierFr(new Date(2027, 0, 3, 0, 5), true), '03-01-2027-00h05');
  assert.equal(D.dateFichierFr(new Date(2026, 11, 31, 23, 59), true), '31-12-2026-23h59');
});

test('dateFichierFr : sans date valable, la date du jour ; jamais NaN ni année en premier', () => {
  [undefined, null, 'x', {}, new Date('pas une date'), 42].forEach((x) => {
    const s = D.dateFichierFr(x);
    assert.match(s, /^\d{2}-\d{2}-\d{4}$/, String(x));
    assert.ok(!/NaN/.test(s));
  });
});

test('le fichier de la disquette s’appelle session-cv-jour-mois-année-heure : plus d’année en premier ni d’heure UTC', () => {
  const app = lire('js/app.js');
  const bloc = app.slice(app.indexOf('function exporterSessionFichier'), app.indexOf('function exporterSessionFichier') + 900);
  assert.match(bloc, /dateFichierFr\(new Date\(\), true\)/);
  assert.ok(!/toISOString/.test(bloc), 'toISOString donne l’année en premier et l’heure UTC');
});
