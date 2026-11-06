const test = require('node:test');
const assert = require('node:assert');
const S = require('../outils/veilleSas.js');

// Demande de Denis (04/11/2026) : une fiche du sas déjà publiée (même identifiant) ferait échouer tout l'enregistrement ;
// le sas la signale donc « déjà publiée », et une fiche qui ressemble à une autre est signalée « doublon possible ».

const ENTETE = '# Registre des structures\n# FORMAT : id | type | nom | description | commune | zone | telephone | site | portee | rayons | source | date\n#\n';
const ligne = (id, nom, site) => [id, 'ccas', nom, 'une phrase', 'Limoges', '', '', site, '87', 'logement', 'Source', ''].join(' | ');
const CTX = { aujourdhui: '2026-11-04', secteurs: [], secteursLibelles: [], communes: ['limoges'], communesNoms: ['Limoges'] };

test('lister : un identifiant déjà publié est signalé (ou « registre », raison « identifiant »)', () => {
  const registre = ENTETE + ligne('asso-base-24', 'BASE', 'https://base.example.org/') + '\n';
  const sas = ENTETE + ligne('asso-base-24', 'BASE', 'https://base.example.org/') + '\n' + ligne('autre-87', 'Autre structure', 'https://autre.example.org/') + '\n';
  const r = S.lister('lieux', sas, { lieux: registre, employeurs: '' }, CTX);
  assert.ok(r.ok);
  const a = r.lignes.filter((l) => l.id === 'asso-base-24')[0], b = r.lignes.filter((l) => l.id === 'autre-87')[0];
  assert.strictEqual(a.doublon.ou, 'registre');
  assert.strictEqual(a.doublon.raison, 'identifiant');
  assert.strictEqual(b.doublon, undefined);
});

test('lister : deux fiches du sas au même site et au nom proche se signalent l\'une l\'autre, sans se signaler elles-mêmes', () => {
  const sas = ENTETE + ligne('mission-locale-a', 'ALEAS Emplois Antenne Nord', 'https://ml.example.org/') + '\n' + ligne('mission-locale-b', 'ALEAS Emplois Antenne Sud', 'https://ml.example.org/') + '\n' + ligne('seule-87', 'Une seule', 'https://seule.example.org/') + '\n';
  const r = S.lister('lieux', sas, { lieux: ENTETE, employeurs: '' }, CTX);
  const a = r.lignes.filter((l) => l.id === 'mission-locale-a')[0], c = r.lignes.filter((l) => l.id === 'seule-87')[0];
  assert.ok(a.doublon && a.doublon.ou === 'sas' && a.doublon.id === 'mission-locale-b');
  assert.strictEqual(c.doublon, undefined);
});

test('lister : sans contexte (compteurs), aucun doublon n\'est calculé', () => {
  const sas = ENTETE + ligne('a-87', 'A', 'https://a.example.org/') + '\n';
  const r = S.lister('lieux', sas, { lieux: sas, employeurs: '' });
  assert.strictEqual(r.lignes[0].doublon, undefined);
});

test('lister : un même site avec deux numéros différents n\'est pas un doublon', () => {
  const l = (id, nom, tel) => [id, 'ccas', nom, 'une phrase', 'Limoges', '', tel, 'https://groupe.example.org/', '87', 'logement', 'Source', ''].join(' | ');
  const sas = ENTETE + l('mercure-a-87', 'Hôtel Mercure Royal', '05 55 00 00 01') + '\n' + l('mercure-b-87', 'Hôtel Mercure Centre', '05 55 00 00 02') + '\n';
  const r = S.lister('lieux', sas, { lieux: ENTETE, employeurs: '' }, CTX);
  assert.strictEqual(r.lignes[0].doublon, undefined);
  assert.strictEqual(r.lignes[1].doublon, undefined);
});

test('lister : une paire de fiches jugée distincte (pas-doublons) n\'est plus signalée', () => {
  const l = (id, nom) => [id, 'ccas', nom, 'une phrase', 'Limoges', '', '', 'https://groupe.example.org/', '87', 'logement', 'Source', ''].join(' | ');
  const sas = ENTETE + l('antenne-a-87', 'ALEAS Emplois Nord') + '\n' + l('antenne-b-87', 'ALEAS Emplois Sud') + '\n';
  const avant = S.lister('lieux', sas, { lieux: ENTETE, employeurs: '' }, CTX);
  assert.ok(avant.lignes[0].doublon);
  const apres = S.lister('lieux', sas, { lieux: ENTETE, employeurs: '' }, Object.assign({}, CTX, { pasDoublons: { 'antenne-a-87|antenne-b-87': true } }));
  assert.strictEqual(apres.lignes[0].doublon, undefined);
  assert.strictEqual(apres.lignes[1].doublon, undefined);
});
