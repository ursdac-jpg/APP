const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// cvPdfTemplateA4.js est un script de navigateur (sans export) : chargement dans un contexte isole.
// normaliserPourComparaison vient de l'application : version minimale (minuscules, sans accents) pour ce test.
const contexte = {
  normaliserPourComparaison: (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateA4.js', 'utf8'), contexte);
const ordonner = (liste, ordre) => JSON.parse(JSON.stringify(contexte._pdfOrdonnerFormationsMien(liste, ordre === undefined ? {} : { ordreFormationsMien: ordre })));

const FORMATIONS = [
  { intitule: 'Titre professionnel Assistante de vie aux familles', annee: '2026' },
  { intitule: 'CAP Petite enfance', annee: '2019' },
  { intitule: 'SST', annee: '2025' }
];
const CLE = (i) => contexte._pdfCleFormation(FORMATIONS[i]);

test('formations : sans « Mon ordre », l\'ordre est inchangé et chaque formation garde sa clé et sa position', () => {
  const r = ordonner(FORMATIONS);
  assert.deepEqual(r.map((f) => f.intitule), FORMATIONS.map((f) => f.intitule));
  assert.deepEqual(r.map((f) => f.__posForm), [0, 1, 2]);
  assert.equal(r[1].__cleForm, CLE(1));
});

test('formations : « Mon ordre » remet les formations dans l\'ordre choisi, la position d\'origine reste attachée à chacune', () => {
  const r = ordonner(FORMATIONS, [CLE(2), CLE(0), CLE(1)]);
  assert.deepEqual(r.map((f) => f.intitule), ['SST', 'Titre professionnel Assistante de vie aux familles', 'CAP Petite enfance']);
  // les corrections de texte du CV (fd:0, fd:1...) suivent la formation, pas la place
  assert.deepEqual(r.map((f) => f.__posForm), [2, 0, 1]);
  assert.equal(contexte._pdfIdxFormation(r[0], 0), 2);
});

test('formations : une formation absente de l\'ordre choisi passe après les autres, dans son ordre habituel', () => {
  const r = ordonner(FORMATIONS, [CLE(1)]);
  assert.deepEqual(r.map((f) => f.intitule), ['CAP Petite enfance', 'Titre professionnel Assistante de vie aux familles', 'SST']);
});

test('formations : liste vide, une seule formation ou ordre vide ne changent rien et ne plantent pas', () => {
  assert.deepEqual(ordonner([], [CLE(0)]), []);
  assert.deepEqual(ordonner([FORMATIONS[0]], [CLE(0)]).length, 1);
  assert.deepEqual(ordonner(FORMATIONS, []).map((f) => f.intitule), FORMATIONS.map((f) => f.intitule));
  assert.deepEqual(ordonner(FORMATIONS, null).map((f) => f.intitule), FORMATIONS.map((f) => f.intitule));
});

test('formations : les objets d\'origine ne sont jamais modifiés', () => {
  ordonner(FORMATIONS, [CLE(2), CLE(1), CLE(0)]);
  assert.equal(FORMATIONS[0].__posForm, undefined);
  assert.equal(FORMATIONS[0].__cleForm, undefined);
});

test('formations : sans la fonction de comparaison chargée, la clé de secours évite toute erreur', () => {
  const sansNormaliser = {};
  vm.createContext(sansNormaliser);
  vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateA4.js', 'utf8'), sansNormaliser);
  const r = sansNormaliser._pdfOrdonnerFormationsMien(FORMATIONS, {});
  assert.equal(r.length, 3);
  assert.equal(typeof r[0].__cleForm, 'string');
});

// --- critères d'ordre (retour Denis 2026-09-30) ---
const AVEC_DATES = [
  { intitule: 'CAP Petite enfance', annee: '2019' },
  { intitule: 'Titre professionnel ADVF', annee: '2026' },
  { intitule: 'Sans date' },
  { intitule: 'BEP', annee: '2015 - 2017' },
  { intitule: 'SST', annee: '2026' }
];
const parCritere = (critere, extra) => JSON.parse(JSON.stringify(contexte._pdfOrdonnerFormationsMien(AVEC_DATES, Object.assign({ ordreFormations: critere }, extra || {})))).map((f) => f.intitule);

test('formations : du plus récent au plus ancien, sans année en dernier, égalité dans l\'ordre habituel', () => {
  assert.deepEqual(parCritere('date-desc'), ['Titre professionnel ADVF', 'SST', 'CAP Petite enfance', 'BEP', 'Sans date']);
});

test('formations : du plus ancien au plus récent (l\'année de fin d\'une période compte), sans année en dernier', () => {
  assert.deepEqual(parCritere('date-asc'), ['BEP', 'CAP Petite enfance', 'Titre professionnel ADVF', 'SST', 'Sans date']);
});

test('formations : critère « pertinence » ou absent = ordre proposé, inchangé', () => {
  assert.deepEqual(parCritere('pertinence'), AVEC_DATES.map((f) => f.intitule));
  assert.deepEqual(parCritere(undefined), AVEC_DATES.map((f) => f.intitule));
});

test('formations : critère « Mon ordre » applique l\'ordre personnel ; sans ordre personnel, l\'ordre proposé', () => {
  const cles = AVEC_DATES.map((f) => contexte._pdfCleFormation(f));
  assert.deepEqual(parCritere('mien', { ordreFormationsMien: [cles[4], cles[3]] }).slice(0, 2), ['SST', 'BEP']);
  assert.deepEqual(parCritere('mien'), AVEC_DATES.map((f) => f.intitule));
});

test('formations : un critère de date ne change pas la position d\'origine attachée à chaque formation (corrections de texte)', () => {
  const r = JSON.parse(JSON.stringify(contexte._pdfOrdonnerFormationsMien(AVEC_DATES, { ordreFormations: 'date-desc' })));
  assert.equal(r.find((f) => f.intitule === 'SST').__posForm, 4);
  assert.equal(r.find((f) => f.intitule === 'Titre professionnel ADVF').__posForm, 1);
});

// --- ordre des missions à l'intérieur d'une expérience, formation ou expérience personnelle (retour Denis 2026-09-30) ---
const SEG = [
  { texte: 'Accueillir les clients', cle: 'mi:1:0' },
  { texte: 'Tenir la caisse', cle: 'mi:1:1' },
  { texte: 'Nettoyer le magasin', cle: 'mi:1:2' }
];
const ordreM = (ordre) => JSON.parse(JSON.stringify(contexte._pdfOrdonnerMissionsMien(SEG, 'mi:1', { ordreMissions: ordre }))).map((s) => s.cle);

test('missions : sans ordre choisi, l\'ordre est inchangé', () => {
  assert.deepEqual(ordreM(undefined), ['mi:1:0', 'mi:1:1', 'mi:1:2']);
  assert.deepEqual(ordreM({}), ['mi:1:0', 'mi:1:1', 'mi:1:2']);
  assert.deepEqual(ordreM({ 'mi:2': ['a'] }), ['mi:1:0', 'mi:1:1', 'mi:1:2']);
});

test('missions : l\'ordre choisi s\'applique, chaque mission garde sa clé (retrait et correction de texte)', () => {
  assert.deepEqual(ordreM({ 'mi:1': ['nettoyer le magasin', 'accueillir les clients', 'tenir la caisse'] }), ['mi:1:2', 'mi:1:0', 'mi:1:1']);
});

test('missions : le point final et la casse ne comptent pas ; une mission absente de l\'ordre passe après', () => {
  assert.equal(contexte._pdfCleMissionOrdre('  Tenir  la caisse. '), 'tenir la caisse');
  assert.deepEqual(ordreM({ 'mi:1': ['tenir la caisse'] }), ['mi:1:1', 'mi:1:0', 'mi:1:2']);
});

test('missions : une seule mission ou une liste vide ne changent rien', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(contexte._pdfOrdonnerMissionsMien([SEG[0]], 'mi:1', { ordreMissions: { 'mi:1': ['x'] } }))).length, 1);
  assert.deepEqual(contexte._pdfOrdonnerMissionsMien([], 'mi:1', { ordreMissions: { 'mi:1': ['x'] } }), []);
});
