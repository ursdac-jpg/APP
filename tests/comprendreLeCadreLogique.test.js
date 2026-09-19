const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du module "Comprendre le cadre" (2e sous-carte de "Se
// tenir informe"). Ajoute lors du chantier de stabilisation (audit du
// 2026-09-13) : ce module n'avait jusque-la aucune couverture Node,
// alors que _comprendreLeCadreParserLiensVerifies decide, fiche par
// fiche, si une adresse est vue comme verifiee donc cliquable
// (mecanisme de securite central, LECONS 9.16). Perimetre cible sur
// les 4 parseurs les plus sensibles, pas exhaustif sur les 2331 lignes
// du fichier (essentiellement du rendu HTML et du branchement DOM,
// non testables sous Node -- voir js/app.js et modules/*/ui.js).
require('./_domStub').installerStubDom();

const {
  _comprendreLeCadreParserFiche,
  _comprendreLeCadreParserLiensVerifies,
  _comprendreLeCadreParserLigneStructure,
  _comprendreLeCadreDateFr
} = require('../modules/comprendre-le-cadre/index.js');

// ---------- _comprendreLeCadreDateFr ----------

test('_comprendreLeCadreDateFr : "annee-mois" devient "mois annee" en toutes lettres', () => {
  assert.equal(_comprendreLeCadreDateFr('2026-09'), 'septembre 2026');
  assert.equal(_comprendreLeCadreDateFr('2026-01'), 'janvier 2026');
});

test('_comprendreLeCadreDateFr : "annee-mois-jour" devient "jour mois annee"', () => {
  assert.equal(_comprendreLeCadreDateFr('2026-09-05'), '5 septembre 2026');
  assert.equal(_comprendreLeCadreDateFr('2026-12-25'), '25 décembre 2026');
});

test('_comprendreLeCadreDateFr : toute autre forme rendue telle quelle', () => {
  assert.equal(_comprendreLeCadreDateFr('texte libre'), 'texte libre');
  assert.equal(_comprendreLeCadreDateFr(''), '');
  assert.equal(_comprendreLeCadreDateFr(undefined), '');
});

// ---------- _comprendreLeCadreParserLiensVerifies ----------
// Mecanisme de securite (LECONS 9.16) : decide si une adresse est
// affichee comme un lien cliquable. Une ligne mal formee ne doit
// jamais produire une entree partielle qui semblerait verifiee.

test('_comprendreLeCadreParserLiensVerifies : une ligne complete donne url + date + portee', () => {
  var table = _comprendreLeCadreParserLiensVerifies('ccas-mairie | https://exemple.fr | 2026-08-01 | Departement');
  assert.deepEqual(table['ccas-mairie'], { url: 'https://exemple.fr', dateVerification: '2026-08-01', portee: 'departement' });
});

test('_comprendreLeCadreParserLiensVerifies : ligne sans date de verification reste vide (adresse non verifiee)', () => {
  var table = _comprendreLeCadreParserLiensVerifies('ccas-mairie | https://exemple.fr | | Departement');
  assert.equal(table['ccas-mairie'].dateVerification, '');
});

test('_comprendreLeCadreParserLiensVerifies : commentaires et lignes vides ignores', () => {
  var table = _comprendreLeCadreParserLiensVerifies('# commentaire\n\nccas-mairie | https://exemple.fr | 2026-08-01 | Departement');
  assert.deepEqual(Object.keys(table), ['ccas-mairie']);
});

test('_comprendreLeCadreParserLiensVerifies : ligne sans separateur "|" ignoree (jamais de cle vide)', () => {
  var table = _comprendreLeCadreParserLiensVerifies('ligne-invalide-sans-pipe\nautre | https://x.fr | 2026-01-01 | Region');
  assert.deepEqual(Object.keys(table), ['autre']);
});

test('_comprendreLeCadreParserLiensVerifies : registre vide donne une table vide', () => {
  assert.deepEqual(_comprendreLeCadreParserLiensVerifies(''), {});
});

// ---------- _comprendreLeCadreParserLigneStructure ----------

test('_comprendreLeCadreParserLigneStructure : separe titre et detail sur " : "', () => {
  var s = _comprendreLeCadreParserLigneStructure('ccas-mairie | CCAS de la commune : aide sociale, domiciliation');
  assert.deepEqual(s, { nom: 'ccas-mairie', titre: 'CCAS de la commune', detail: 'aide sociale, domiciliation' });
});

test('_comprendreLeCadreParserLigneStructure : sans " : ", la description entiere sert de titre', () => {
  var s = _comprendreLeCadreParserLigneStructure('sans-detail | Juste un titre sans separateur');
  assert.deepEqual(s, { nom: 'sans-detail', titre: 'Juste un titre sans separateur', detail: '' });
});

test('_comprendreLeCadreParserLigneStructure : colonnes surnumeraires (url candidate, date) ignorees', () => {
  var s = _comprendreLeCadreParserLigneStructure('ccas-mairie | CCAS de la commune : aide sociale | https://exemple.fr | 2026-08-01');
  assert.equal(s.nom, 'ccas-mairie');
  assert.equal(s.titre, 'CCAS de la commune');
  assert.equal(s.detail, 'aide sociale');
});

// ---------- _comprendreLeCadreParserFiche ----------

function ficheMarkdown(entete, corps) {
  return '---\n' + entete + '\n---\n' + (corps || 'Corps de la fiche.');
}

test('_comprendreLeCadreParserFiche : sans frontmatter valide, renvoie null', () => {
  assert.equal(_comprendreLeCadreParserFiche('pas de frontmatter du tout'), null);
});

test('_comprendreLeCadreParserFiche : champs simples, listes et corps extraits correctement', () => {
  var md = ficheMarkdown(
    'id: emploi-test\n' +
    'rayon: emploi\n' +
    'titre: Titre test\n' +
    'pour_qui: Tous\n' +
    'territoire: national\n' +
    'statut: actif\n' +
    'frein: true\n' +
    'tags: [emploi, aide]\n' +
    'sources:\n' +
    '  - source-un\n' +
    '  - source-deux',
    'Corps de la fiche.'
  );
  var f = _comprendreLeCadreParserFiche(md);
  assert.equal(f.id, 'emploi-test');
  assert.equal(f.titre, 'Titre test');
  assert.equal(f.frein, true);
  assert.deepEqual(f.tags, ['emploi', 'aide']);
  assert.deepEqual(f.sources, ['source-un', 'source-deux']);
  assert.equal(f.corps, 'Corps de la fiche.');
});

test('_comprendreLeCadreParserFiche : frein absent devient false, pas undefined (jamais un etat ambigu)', () => {
  var f = _comprendreLeCadreParserFiche(ficheMarkdown('id: sans-frein\ntitre: Sans frein'));
  assert.equal(f.frein, false);
});

test('_comprendreLeCadreParserFiche : bloc lexique (terme + definition) extrait en paire', () => {
  var md = ficheMarkdown(
    'id: avec-lexique\n' +
    'titre: Avec lexique\n' +
    'lexique:\n' +
    '  - terme: "CSP"\n' +
    '    definition: "Contrat de securisation professionnelle"'
  );
  var f = _comprendreLeCadreParserFiche(md);
  assert.deepEqual(f.lexique, [{ terme: 'CSP', definition: 'Contrat de securisation professionnelle' }]);
});

test('_comprendreLeCadreParserFiche : listes absentes du frontmatter restent des tableaux vides', () => {
  var f = _comprendreLeCadreParserFiche(ficheMarkdown('id: minimal\ntitre: Minimal'));
  assert.deepEqual(f.tags, []);
  assert.deepEqual(f.sources, []);
  assert.deepEqual(f.voir_aussi_lexique, []);
});
