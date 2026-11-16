/* ============================================================
   tests/formationsMetiers.test.js  (2026-11-15)
   ------------------------------------------------------------
   Bloc « Vos diplômes » : logique pure des propositions (modules/formations-metiers/logique.js), sur le répertoire réel du ROME.
   Maquette validée : docs/MAQUETTE_VOS_DIPLOMES_2026-11-15.html (consignes 341 à 352).
   L'interface (js/app.js) reste vérifiée au navigateur.
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const L = require('../modules/formations-metiers/logique.js');

// Le répertoire est un fichier navigateur (var REPERTOIRE_ROME = ...) : on l'évalue dans un contexte isolé.
function chargerRepertoire() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'data', 'repertoireRome.js'), 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(code + '\nthis.R = REPERTOIRE_ROME;', ctx);
  return ctx.R;
}
const REP = chargerRepertoire();
const INDEX = L.fmIndexRepertoire(REP);

test('index : un métier par code, 21 secteurs, chaque famille a un nom', () => {
  assert.equal(INDEX.parDomaine.length, 21);
  assert.ok(Object.keys(INDEX.parCode).length > 1800);
  const sansNom = {};
  Object.keys(INDEX.parCode).forEach(c => { const f = INDEX.parCode[c].fam; if (!L.FM_FAMILLES[f]) { sansNom[f] = 1; } });
  assert.deepEqual(Object.keys(sansNom), [], 'toute famille du répertoire doit avoir un nom');
  assert.equal(Object.keys(L.FM_FAMILLES).length, 110);
});

test('table de diplômes : chaque code cité existe dans le répertoire réel', () => {
  const absents = [];
  L.FM_TABLE_DIPLOMES.forEach(l => l[1].forEach(c => { if (!INDEX.parCode[c]) { absents.push(c); } }));
  assert.deepEqual(absents, []);
});

test('fmMetiersDuDiplome : diplômes courants reconnus, diplôme inconnu = rien', () => {
  const noms = i => L.fmMetiersDuDiplome(i, INDEX).map(m => m.nom);
  assert.ok(noms('CAP Cuisine').includes('Agent de cuisine'));
  assert.ok(noms('Bac pro Métiers du commerce et de la vente').length >= 3);
  assert.ok(noms('BTS Services informatiques aux organisations').length >= 3);
  assert.deepEqual(noms('Diplôme de l’étranger'), []);
  assert.deepEqual(noms(''), []);
  assert.deepEqual(L.fmMetiersDuDiplome('CAP Cuisine', null), []);
});

test('fmProposes : toujours 4 métiers quand le diplôme est reconnu, sans doublon, 0 sinon', () => {
  ['CAP Cuisine', 'Bac pro Commerce', 'Bac pro ASSP', 'BTS SIO', 'Titre pro ADVF', 'BTS Électrotechnique'].forEach(i => {
    const p = L.fmProposes(i, INDEX);
    assert.equal(p.length, L.FM_NB_PROPOSES, i);
    assert.equal(new Set(p.map(m => m.code)).size, p.length, 'pas de doublon : ' + i);
  });
  assert.equal(L.fmProposes('Diplôme de l’étranger', INDEX).length, 0);
  assert.equal(L.fmProposes('Bac général', INDEX).length, 0);
});

test('fmProposes : le complément vient de la même famille que le premier métier quand elle suffit', () => {
  const p = L.fmProposes('CAP Cuisine', INDEX);
  const fam = p[0].fam;
  assert.ok(p.slice(0, 3).every(m => m.fam === fam), 'les trois premiers sont de la famille ' + fam);
});

test('fmSecteursDesPropositions : sans doublon, dans l’ordre', () => {
  const p = L.fmProposes('CAP Cuisine', INDEX);
  assert.deepEqual(L.fmSecteursDesPropositions(p), [p[0].d]);
  assert.deepEqual(L.fmSecteursDesPropositions([]), []);
});

test('fmDetecterPratique et fmPresetDetail : le préréglage dépend du diplôme et du dossier, jamais bloquant', () => {
  assert.equal(L.fmPresetDetail('Bac général', 'diplome', false), 'non');
  assert.equal(L.fmPresetDetail('Licence de droit', 'diplome', false), 'non');
  assert.equal(L.fmPresetDetail('CAP Cuisine', 'diplome', false), 'oui');
  assert.equal(L.fmPresetDetail('CAP Cuisine', 'diplome', true), 'non');
  assert.equal(L.fmPresetDetail('BTS SIO', 'diplome', false), 'oui');
  assert.equal(L.fmPresetDetail('Assistant de vie aux familles', 'titrepro', false), 'oui');
  assert.equal(L.fmPresetDetail('Assistant de vie aux familles', 'titrepro', true), 'non');
  assert.equal(L.fmPresetDetail('Bac techno STMG', 'diplome', false), null);
  assert.equal(L.fmPresetDetail('Diplôme de l’étranger', 'diplome', false), null);
  assert.equal(L.fmPresetDetail('', 'diplome', false), null);
});

test('fmListeSecteur : aucun métier déjà proposé, familles des métiers proposés en premier, filtre par mots', () => {
  const proposes = L.fmProposes('CAP Cuisine', INDEX);
  const codes = proposes.map(m => m.code);
  const liste = L.fmListeSecteur(INDEX, proposes[0].d, codes, '');
  assert.ok(liste.length > 1);
  const tous = [];
  liste.forEach(f => f.metiers.forEach(m => tous.push(m.code)));
  codes.forEach(c => assert.ok(!tous.includes(c), 'doublon : ' + c));
  assert.equal(liste[0].code, proposes[0].fam, 'la famille des métiers proposés vient en premier');
  liste.forEach(f => assert.ok(f.metiers.length > 0, 'pas de famille vide'));
  assert.ok(liste.every(f => f.nom && f.nom !== f.code));
  const filtre = L.fmListeSecteur(INDEX, proposes[0].d, codes, 'plonge');
  const nomsFiltres = [];
  filtre.forEach(f => f.metiers.forEach(m => nomsFiltres.push(m.nom)));
  assert.ok(nomsFiltres.length >= 1 && nomsFiltres.every(n => /plong/i.test(n)));
  assert.deepEqual(L.fmListeSecteur(INDEX, null, [], ''), []);
});

test('fmNettoyerMissions : retire les missions d’un métier décoché, garde celles des autres', () => {
  const fiches = { A1: { mi: ['a', 'b'] }, B2: { mi: ['c'] } };
  assert.deepEqual(L.fmNettoyerMissions(['a', 'c', 'z'], [{ code: 'A1' }], fiches), ['a']);
  assert.deepEqual(L.fmNettoyerMissions(['a', 'c'], [{ code: 'A1' }, { code: 'B2' }], fiches), ['a', 'c']);
  assert.deepEqual(L.fmNettoyerMissions(['a'], [], fiches), []);
  assert.deepEqual(L.fmMissionsDeFiche(fiches, 'inconnu'), []);
});

test('les fiches du ROME des métiers proposés ont des missions prêtes à cocher', () => {
  const dossierFiches = path.join(__dirname, '..', 'data', 'rome');
  ['CAP Cuisine', 'Bac pro Commerce', 'Bac pro ASSP', 'BTS SIO'].forEach(i => {
    L.fmProposes(i, INDEX).forEach(m => {
      const ctx = { window: {} };
      vm.createContext(ctx);
      vm.runInContext(fs.readFileSync(path.join(dossierFiches, 'fiche_' + m.code.charAt(0) + '.js'), 'utf8'), ctx);
      const fiche = (ctx.window.FICHES_ROME || ctx.FICHES_ROME || {})[m.code];
      assert.ok(fiche, 'fiche absente : ' + m.code);
      assert.ok(L.fmMissionsDeFiche({ [m.code]: fiche }, m.code).length >= 1, 'aucune mission : ' + m.nom);
    });
  });
});
