// Harmonie des films (décision de Denis du 25/11/2026, maquette docs/maquettes/maquette-films-sur-les-cartes-2026-11-25.html) :
// le film est sur la carte de chaque chemin, au même endroit dans tous les modules : après la description, avant les détails et les boutons.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { VIDEOS_PRESENTATION } = require('../modules/video-presentation/videoPresentation.js');
const D = require('../data/buiaEntree.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8').replace(/\r\n/g, '\n');
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const avant = (t, a, b, msg) => {
  const i = t.indexOf(a), j = t.indexOf(b);
  assert.ok(i >= 0 && j >= 0, msg + ' : repère introuvable (' + (i < 0 ? a : b) + ')');
  assert.ok(i < j, msg);
};

test('Bien utiliser l’IA : chaque tuile porte le film de son chemin, entre la description et le détail ; la clé existe dans la table', () => {
  const index = lire('modules/bien-utiliser-ia/index.js');
  const fn = index.slice(index.indexOf('function _buiaHtmlIntention'), index.indexOf('function _buiaHtmlEntree'));
  avant(fn, 'c.titre', 'c.quand', 'titre avant « à qui »');
  avant(fn, 'c.quand', 'c.texte', '« à qui » avant la description');
  avant(fn, 'c.texte', "htmlVideoPresentation('bien-utiliser-ia-' + c.id)", 'le film après la description');
  avant(fn, "htmlVideoPresentation('bien-utiliser-ia-' + c.id)", 'c.detail', 'le film avant le détail');
  avant(fn, 'c.detail', 'c.bouton', 'le détail avant le bouton');
  D.BUIA_CHEMINS.forEach((c) => assert.ok(VIDEOS_PRESENTATION['bien-utiliser-ia-' + c.id], 'film du chemin ' + c.id));
});

test('Bien utiliser l’IA : le film n’est plus en haut de l’écran du chemin (un seul endroit, jamais deux)', () => {
  ['comprendreUi', 'fonctionneUi', 'libreUi', 'modelesUi'].forEach((f) => {
    const t = sansCommentaires(lire('modules/bien-utiliser-ia/' + f + '.js'));
    assert.ok(!/htmlVideoPresentation|_buiaVideoChemin/.test(t), f);
  });
});

test('Explorer les métiers : le film est avant les trois repères, après la question « à qui »', () => {
  const t = lire('modules/comprendre-les-metiers/index.js');
  const carte = t.slice(t.indexOf('var carte = function (icone'), t.indexOf('var avecResultat'));
  avant(carte, 'cml-pour', 'htmlVideoPresentation(CMV_PRESENTATIONS[chemin].video)', 'le film après « à qui »');
  avant(carte, 'htmlVideoPresentation(CMV_PRESENTATIONS[chemin].video)', 'cml-reperes', 'le film avant les repères');
  avant(carte, 'cml-reperes', 'data-cml="entrer"', 'les repères avant le bouton');
});

test('Créer, Reprendre, Version rapide : le bloc d’un chemin met le film après la phrase et avant la liste', () => {
  const t = lire('data/metiers.js');
  const fn = t.slice(t.indexOf('function _htmlVoiePresentation'), t.indexOf('var REPRENDRE_CV_VOIES'));
  avant(fn, 'o.temps', 'voie-presentation-tete', 'le repère de temps en tête');
  avant(fn, 'voie-presentation-tete', 'voie-presentation-phrase', 'le titre avant la phrase');
  avant(fn, 'voie-presentation-phrase', 'htmlVideoPresentation(o.video)', 'le film après la phrase');
  avant(fn, 'htmlVideoPresentation(o.video)', 'o.listeHtml', 'le film avant la liste');
});

test('Ce qui compte pour moi : le film de la rubrique est sous sa phrase et avant ses cartes ; les cartes n’ont pas de film propre', () => {
  const t = sansCommentaires(lire('modules/ce-qui-compte/index.js'));
  const fn = t.slice(t.indexOf('function _cqcpmHtmlAccueil'), t.indexOf('function _cqcpmHtmlAvertImpression'));
  avant(fn, 'class="tete"', "htmlVideoPresentation('ce-qui-compte-' + t.id)", 'le film après l’en-tête de la rubrique');
  avant(fn, "htmlVideoPresentation('ce-qui-compte-' + t.id)", 'class="cqcpm-cartes', 'le film avant les cartes');
  assert.equal((fn.match(/htmlVideoPresentation\(/g) || []).length, 1, 'un seul film dans l’accueil : celui de la rubrique');
});

test('Ce qui compte pour moi : toute clé de film de rubrique présente dans la table correspond à une rubrique existante', () => {
  const C = require('../modules/ce-qui-compte/logique.js');
  const rubriques = C.cqcpmThemes().map((t) => t.id);
  Object.keys(VIDEOS_PRESENTATION).filter((k) => k.indexOf('ce-qui-compte-') === 0).forEach((k) => assert.ok(rubriques.includes(k.replace('ce-qui-compte-', '')), k));
});

test('feuille de style du film : le bouton remplit la carte (tuile, carte, rubrique) et passe sous l’aperçu quand la carte est étroite', () => {
  const css = lire('modules/video-presentation/videoPresentation.css');
  ['.buia-intention .vp', '.cml-entree .vp', '.cqcpm-theme-bloc .vp'].forEach((s) => assert.ok(css.includes(s), s));
  assert.ok(/\.vp \{ container-type: inline-size; \}/.test(css) && /@container \(max-width: \d+px\)/.test(css));
});

test('la règle est écrite dans le langage visuel commun', () => {
  const doc = lire('docs/LANGAGE_VISUEL_COMMUN.md');
  assert.ok(/le film est au même endroit dans tous les modules/i.test(doc));
  assert.ok(doc.includes('tests/harmonieFilmsCartes.test.js'));
});
