// Repère de temps à trois niveaux (consignes 605 à 607) : données (data/tempsModules.js), composant, branchement.
// Le branchement des modules (js/app.js, modules/*/index.js) n'est pas chargé par les tests Node : ici on vérifie les sources, et le navigateur fait le reste.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const T = require('../data/tempsModules.js');

const lire = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('trois mots exacts, sans minutes', () => {
  assert.deepStrictEqual(T.TEMPS_MOTS, { 1: 'Rapide', 2: 'Un peu plus long', 3: 'À prendre à votre rythme' });
  Object.values(T.TEMPS_MOTS).forEach((m) => assert.ok(!/\d|min|heure/i.test(m), 'jamais de durée annoncée : ' + m));
});

test('les 22 modules ont un niveau de 1 à 3', () => {
  const ids = Object.keys(T.TEMPS_MODULES);
  assert.strictEqual(ids.length, 22);
  ids.forEach((id) => assert.ok([1, 2, 3].includes(T.TEMPS_MODULES[id].n), id));
});

test('niveaux choisis par Denis (consigne 606)', () => {
  const attendu = { creer: 2, reprendre: 2, rapide: 1, lettre: 2, entretien: 2, employeurs: 1, reperes: 1, carnet: 1, lexique: 1, competences: 2, compte: 3, buia: 3, bilan: 2, regard: 2, ats: 2, coherence: 2, cadre: 1, chiffres: 1, quifaitquoi: 1, pistes: 2, ucpm: 2, metiers: 3 };
  Object.keys(attendu).forEach((id) => assert.strictEqual(T.tempsNiveauModule(id), attendu[id], id));
  const ch = (id) => Object.values(T.TEMPS_MODULES[id].chemins);
  assert.deepStrictEqual(ch('creer'), [1, 1, 3]);
  assert.deepStrictEqual(ch('reprendre'), [1, 1, 3]);
  assert.deepStrictEqual(ch('rapide'), [1, 1]);
  assert.deepStrictEqual(ch('compte'), [2, 2, 2, 2, 2, 3, 3, 1]);
  assert.deepStrictEqual(ch('buia'), [1, 2, 2, 3]);
  assert.deepStrictEqual(ch('metiers'), [1, 2, 3, 1]);
});

test('niveau inconnu : rien d’affiché', () => {
  assert.strictEqual(T.tempsNiveauModule('nexistepas'), 0);
  assert.strictEqual(T.tempsNiveauChemin('metiers', 'nexistepas'), 0);
  assert.strictEqual(T.htmlRepereTempsModule('nexistepas'), '');
  assert.strictEqual(T.htmlRepereTempsChemin('lexique', 'x'), '');
  assert.strictEqual(T.htmlRepereTemps(4, true), '');
});

test('page de module : préfixe « Temps à prévoir : » ; carte de chemin : pas de préfixe', () => {
  const page = T.htmlRepereTempsModule('compte');
  assert.ok(/Temps à prévoir :<\/span>/.test(page) && /À prendre à votre rythme/.test(page) && /data-niveau="3"/.test(page));
  const carte = T.htmlRepereTempsChemin('metiers', 'metier');
  assert.ok(!/repere-temps-pre/.test(carte) && /Rapide/.test(carte) && /data-niveau="1"/.test(carte));
  assert.ok(/aria-label="Temps à prévoir : rapide"/.test(carte), 'lu à voix haute même sans le préfixe visible');
  assert.strictEqual((page.match(/<i><\/i>/g) || []).length, 3, 'trois points toujours');
});

test('aucun tiret long dans les données', () => {
  assert.ok(!/[—–]/.test(lire('data/tempsModules.js')));
});

test('chargé avant js/app.js, et jamais sur les tuiles de l’accueil', () => {
  const html = lire('index.html');
  assert.ok(html.indexOf('data/tempsModules.js') > 0 && html.indexOf('<script src="data/tempsModules.js"') < html.indexOf('<script src="js/app.js"'));
  const app = lire('js/app.js');
  assert.ok(!/htmlRepereTemps(Chemin)?\(/.test(app.replace(/htmlRepereTempsModule\(config\.temps\)/g, '')), 'js/app.js : seulement le composant de page, aucune tuile');
});

test('chaque page de présentation branchée donne un identifiant connu', () => {
  const sources = ['js/app.js', 'data/metiers.js', 'modules/bien-utiliser-ia/index.js', 'modules/ce-qui-compte/index.js', 'modules/comprendre-les-metiers/index.js', 'modules/mes-competences/index.js',
    'modules/un-cv-plusieurs-metiers/index.js', 'modules/carnet/index.js', 'modules/lexique/index.js', 'modules/reperes/index.js', 'modules/coherence-transversale/ui.js'];
  const vus = new Set();
  sources.forEach((f) => { (lire(f).match(/\btemps: '([a-z]+)'/g) || []).forEach((m) => vus.add(m.replace(/.*'([a-z]+)'/, '$1'))); });
  vus.forEach((id) => assert.ok(T.TEMPS_MODULES[id], 'identifiant inconnu : ' + id));
  ['buia', 'compte', 'metiers', 'competences', 'ucpm', 'carnet', 'lexique', 'reperes', 'coherence', 'bilan', 'pistes', 'creer', 'reprendre', 'rapide', 'lettre', 'entretien', 'employeurs', 'regard', 'ats', 'cadre', 'chiffres', 'quifaitquoi'].forEach((id) => assert.ok(vus.has(id), 'page non branchée : ' + id));
});

test('le style existe, avec ses règles précises et sans couleur en dur', () => {
  const css = lire('css/style.css');
  assert.ok(/\.repere-temps \.repere-temps-pts i \{/.test(css));
  const bloc = css.slice(css.indexOf('Repère de temps à trois niveaux'));
  assert.ok(!/#[0-9a-fA-F]{3,6}\b/.test(bloc), 'couleurs par variables (mode sombre déjà couvert)');
});

test('cartes de chemins branchées, avec les vrais identifiants des chemins', () => {
  const T2 = require('../data/tempsModules.js');
  const attendus = [
    ['modules/comprendre-les-metiers/index.js', "htmlRepereTempsChemin('metiers', chemin)", 'metiers', ['metier', 'actions', 'q', 'recrute']],
    ['modules/bien-utiliser-ia/index.js', "htmlRepereTempsChemin('buia', c.id)", 'buia', ['comprendre', 'fonctionne', 'modeles', 'ecrire']],
    ['modules/ce-qui-compte/index.js', "htmlRepereTempsChemin('compte', c.id)", 'compte', ['envies', 'inspirent', 'journee', 'valeurs', 'conditions', 'experiences', 'aide', 'pas']]
  ];
  attendus.forEach(([f, appel, id, cles]) => {
    assert.ok(lire(f).includes(appel), f + ' : appel du repère de chemin');
    assert.deepStrictEqual(Object.keys(T2.TEMPS_MODULES[id].chemins), cles, id + ' : identifiants de chemins');
  });
  const metiers = lire('data/metiers.js');
  ["temps: ['reprendre', id]", "temps: ['rapide', id]", "temps: ['creer', id]", "htmlRepereTempsChemin('rapide', p.id, true)", "htmlRepereTempsChemin('reprendre', v.id, true)"].forEach((s) => assert.ok(metiers.includes(s), s));
  assert.deepStrictEqual(Object.keys(T2.TEMPS_MODULES.creer.chemins), ['assistant', 'recit', 'main']);
  assert.deepStrictEqual(Object.keys(T2.TEMPS_MODULES.reprendre.chemins), ['maj', 'reformuler', 'sans']);
  assert.deepStrictEqual(Object.keys(T2.TEMPS_MODULES.rapide.chemins), ['lettre', 'entretien']);
});

test('dans un bouton, la ligne du repère est un span (HTML valide)', () => {
  assert.ok(/^<span class="repere-temps-ligne">/.test(T.htmlRepereTempsChemin('rapide', 'lettre', true)));
  assert.ok(/^<div class="repere-temps-ligne">/.test(T.htmlRepereTempsChemin('rapide', 'lettre')));
});

test('une ligne « Nouveautés » annonce le repère de temps', () => {
  assert.ok(/titre: 'Un repère de temps dans chaque module'/.test(lire('data/nouveautes.js')));
});
