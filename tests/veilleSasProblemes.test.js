const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const S = require('../outils/veilleSas.js');
const T = require('../outils/veilleTerritoire.js');

// Demande de Denis (04/11/2026) : une fiche du sas qui ne passerait pas les contrôles du registre (site sans https, commune inconnue...)
// fait échouer tout l'enregistrement. Le sas la signale donc d'avance (« problemes »), avec le même vérificateur que l'enregistrement.

const racine = path.join(__dirname, '..');
const CTX = Object.assign({}, T.contexteDepuis(racine, '2026-11-04'), { aujourdhui: '2026-11-04' });
const registre = fs.readFileSync(path.join(racine, 'modules/mon-territoire/contenu/lieux.txt'), 'utf8');
const ENTETE = '# FORMAT : id | type | nom | description | commune | zone | telephone | site | portee | rayons | source | date\n';
const ligne = (id, commune, site) => [id, 'ccas', 'Structure ' + id, 'Une phrase de présentation.', commune, '', '05 55 00 00 00', site, '87', 'logement', 'Source officielle', ''].join(' | ');

test('lister : une adresse http et une commune inconnue sont signalées, une fiche correcte ne l\'est pas', () => {
  const sas = ENTETE + ligne('essai-bonne-87', 'Limoges', 'https://essai-bonne.example.org/') + '\n' + ligne('essai-http-87', 'Limoges', 'http://essai-http.example.org/') + '\n' + ligne('essai-commune-87', 'Pessac', 'https://essai-commune.example.org/') + '\n';
  const r = S.lister('lieux', sas, { lieux: registre, employeurs: '', offres: '' }, CTX);
  assert.ok(r.ok);
  const par = (id) => r.lignes.filter((l) => l.id === id)[0];
  assert.strictEqual(par('essai-bonne-87').problemes, undefined);
  assert.ok(par('essai-http-87').problemes.some((m) => /https/.test(m)));
  assert.ok(par('essai-commune-87').problemes.some((m) => /Pessac/.test(m)));
});

test('lister : sans contexte (compteurs), aucun contrôle n\'est joué', () => {
  const sas = ENTETE + ligne('essai-http-87', 'Limoges', 'http://essai-http.example.org/') + '\n';
  const r = S.lister('lieux', sas, { lieux: registre, employeurs: '', offres: '' });
  assert.strictEqual(r.lignes[0].problemes, undefined);
});
