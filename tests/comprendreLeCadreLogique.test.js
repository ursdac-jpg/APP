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

test('_comprendreLeCadreDateFr : "annee-mois" devient "mois annee" abrégé', () => {
  assert.equal(_comprendreLeCadreDateFr('2026-09'), 'sept. 2026');
  assert.equal(_comprendreLeCadreDateFr('2026-01'), 'janv. 2026');
  assert.equal(_comprendreLeCadreDateFr('2026-03'), 'mars 2026');
});

test('_comprendreLeCadreDateFr : "annee-mois-jour" devient "jour mois annee"', () => {
  assert.equal(_comprendreLeCadreDateFr('2026-09-05'), '5 sept. 2026');
  assert.equal(_comprendreLeCadreDateFr('2026-10-13'), '13 oct. 2026');
  assert.equal(_comprendreLeCadreDateFr('2026-12-25'), '25 déc. 2026');
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

// Fiche à chiffres non revérifiée depuis six mois : avertissement (sans chiffre dans la phrase).
test('_comprendreLeCadreFichePerimee : six mois ou plus avec un chiffre = périmée, sinon non', () => {
  const m = require('../modules/comprendre-le-cadre/index.js');
  const f = (v, corps) => ({ verifie_le: v, corps: corps });
  assert.strictEqual(m._comprendreLeCadreFichePerimee(f('2026-01-10', 'Délai de 30 jours'), '2026-07-10'), true);
  assert.strictEqual(m._comprendreLeCadreFichePerimee(f('2026-01-10', 'Délai de 30 jours'), '2026-07-09'), false);
  assert.strictEqual(m._comprendreLeCadreFichePerimee(f('2026-01', 'Délai de 30 jours'), '2026-07-09'), true);
  assert.strictEqual(m._comprendreLeCadreFichePerimee(f('2025-01-10', 'Aucun chiffre ici'), '2026-07-10'), false);
});

// Consigne 95 (Denis, option 1, 05/11/2026) : passé six mois, une fiche à chiffres montre sa phrase générale (ou la phrase commune) à la place du texte.
test('_comprendreLeCadreCorpsAffiche : à jour = le texte ; six mois ou plus = la phrase générale de la fiche, ou la phrase commune, jamais un chiffre', () => {
  const m = require('../modules/comprendre-le-cadre/index.js');
  const fiche = (extra) => Object.assign({ verifie_le: '2026-01-10', corps: 'Le plafond est de 30 jours.\n\nDeuxième paragraphe.' }, extra || {});
  const aJour = m._comprendreLeCadreCorpsAffiche(fiche(), '2026-03-10');
  assert.ok(aJour.indexOf('30 jours') !== -1 && aJour.indexOf('data-cadre-phrase-generale') === -1);
  const propre = m._comprendreLeCadreCorpsAffiche(fiche({ phrase_generale: 'Le plafond change régulièrement.' }), '2026-07-10');
  assert.ok(propre.indexOf('Le plafond change régulièrement.') !== -1 && propre.indexOf('data-cadre-phrase-generale="fiche"') !== -1);
  assert.ok(propre.indexOf('30 jours') === -1 && propre.indexOf('Deuxième paragraphe') === -1, 'le texte précis ne s\'affiche plus');
  const commune = m._comprendreLeCadreCorpsAffiche(fiche(), '2026-07-10');
  assert.ok(commune.indexOf(m.COMPRENDRE_LE_CADRE_PHRASE_COMMUNE_PERIMEE) !== -1 && commune.indexOf('data-cadre-phrase-generale="commune"') !== -1);
  assert.ok(!/\d/.test(m.COMPRENDRE_LE_CADRE_PHRASE_COMMUNE_PERIMEE), 'la phrase commune ne contient aucun chiffre');
  // Une fiche sans chiffre n'est jamais remplacée, même très ancienne.
  const sans = m._comprendreLeCadreCorpsAffiche({ verifie_le: '2020-01-10', corps: 'Aucun chiffre ici.' }, '2026-07-10');
  assert.ok(sans.indexOf('Aucun chiffre ici.') !== -1 && sans.indexOf('data-cadre-phrase-generale') === -1);
});

test('_comprendreLeCadreAvertissementPerime : le bandeau annonce que les chiffres ne sont plus affichés (sans chiffre dans la phrase)', () => {
  const m = require('../modules/comprendre-le-cadre/index.js');
  const bandeau = m._comprendreLeCadreAvertissementPerime({ verifie_le: '2026-01-10', corps: 'Délai de 30 jours' }, '2026-07-10');
  assert.ok(bandeau.indexOf('data-cadre-perime="oui"') !== -1 && /ne sont plus affichés/.test(bandeau));
  assert.ok(!/\d/.test(bandeau.replace(/<[^>]*>/g, '')));
  assert.strictEqual(m._comprendreLeCadreAvertissementPerime({ verifie_le: '2026-06-10', corps: 'Délai de 30 jours' }, '2026-07-10'), '');
});

test('_comprendreLeCadreParserFiche lit phrase_generale (vide par défaut)', () => {
  const avec = _comprendreLeCadreParserFiche('---\nid: x\nrayon: r\ntitre: "T"\nphrase_generale: "Ça change souvent."\n---\nCorps');
  assert.strictEqual(avec.phrase_generale, 'Ça change souvent.');
  assert.strictEqual(_comprendreLeCadreParserFiche('---\nid: x\nrayon: r\ntitre: "T"\n---\nCorps').phrase_generale, '');
});
