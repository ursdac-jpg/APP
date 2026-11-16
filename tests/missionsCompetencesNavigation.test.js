const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Plomberie des étapes de « Créer un nouveau CV » avec l'étape « Vos missions et compétences » (lot 3a, consigne 304).
// Interrupteur fermé : le parcours est EXACTEMENT celui d'avant. Ouvert : une étape de plus entre « Votre parcours » et « Votre profil ».
const racine = path.join(__dirname, '..');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'metiersRome.js'), 'utf8'), ctx);
vm.runInContext('var MC_OUVERT = false; var dossier = { modeCreation: "nouveau", creationSansAssistant: false };', ctx);
vm.runInContext(fs.readFileSync(path.join(racine, 'data', 'metiers.js'), 'utf8'), ctx);
const reglage = (ouvert, sans) => { ctx.MC_OUVERT = ouvert; ctx.dossier.creationSansAssistant = sans; };
const labels = (l) => Array.from(l, (e) => e.label);
const appelle = (f, ...a) => ctx[f](...a);
const routesDe = () => Array.from(appelle('_creerCvRoutes')); // copie : les tableaux viennent d'un autre contexte d'exécution

test('interrupteur fermé : les étapes et les routes sont celles d\'avant, avec et sans assistant', () => {
  reglage(false, false);
  assert.deepEqual(labels(appelle('_creerCvEtapes')), ['Votre objectif', 'Vos informations', 'Votre parcours', 'Votre profil', 'Assistant', 'Vos documents']);
  assert.deepEqual(routesDe(), ['objectif', 'projet', 'votre-parcours', 'revelation', 'assistant', 'resultats']);
  const avant = { objectif: 0, projet: 1, 'votre-parcours': 2, revelation: 3, assistant: 4, resultats: 5 };
  Object.keys(avant).forEach((r) => assert.equal(appelle('_creerCvNavIndex', r), avant[r], r));
  assert.equal(appelle('_creerCvRouteApresParcours'), 'revelation');
  assert.equal(appelle('_creerCvRouteAvantProfil'), 'votre-parcours');
  reglage(false, true);
  assert.deepEqual(labels(appelle('_creerCvEtapes')), ['Votre objectif', 'Vos informations', 'Votre parcours', 'Votre profil', 'Vos documents']);
  assert.deepEqual(routesDe(), ['objectif', 'projet', 'votre-parcours', 'revelation', 'resultats']);
  const sans = { objectif: 0, projet: 1, 'votre-parcours': 2, revelation: 3, assistant: 3, resultats: 4 };
  Object.keys(sans).forEach((r) => assert.equal(appelle('_creerCvNavIndex', r), sans[r], r));
});

test('interrupteur ouvert : une étape de plus entre « Votre parcours » et « Votre profil »', () => {
  reglage(true, false);
  assert.deepEqual(labels(appelle('_creerCvEtapes')), ['Votre objectif', 'Vos informations', 'Votre parcours', 'Vos missions et compétences', 'Votre profil', 'Assistant', 'Vos documents']);
  assert.deepEqual(routesDe(), ['objectif', 'projet', 'votre-parcours', 'missions-competences', 'revelation', 'assistant', 'resultats']);
  assert.equal(appelle('_creerCvNavIndex', 'missions-competences'), 3);
  assert.equal(appelle('_creerCvNavIndex', 'revelation'), 4);
  assert.equal(appelle('_creerCvNavIndex', 'resultats'), 6);
  assert.equal(appelle('_creerCvRouteApresParcours'), 'missions-competences');
  assert.equal(appelle('_creerCvRouteAvantProfil'), 'missions-competences');
  reglage(true, true);
  assert.deepEqual(labels(appelle('_creerCvEtapes')), ['Votre objectif', 'Vos informations', 'Votre parcours', 'Vos missions et compétences', 'Votre profil', 'Vos documents']);
  assert.deepEqual(routesDe(), ['objectif', 'projet', 'votre-parcours', 'missions-competences', 'revelation', 'resultats']);
  assert.equal(appelle('_creerCvNavIndex', 'assistant'), 4, 'sans assistant, la page assistant reste sur « Votre profil »');
  assert.equal(appelle('_creerCvNavIndex', 'resultats'), 5);
});

test('dans les quatre cas, une route par étape et l\'index et la route sont inverses l\'un de l\'autre', () => {
  [false, true].forEach((ouvert) => [false, true].forEach((sans) => {
    reglage(ouvert, sans);
    const routes = routesDe(), etapes = appelle('_creerCvEtapes');
    assert.equal(routes.length, etapes.length, 'ouvert=' + ouvert + ' sans=' + sans);
    routes.forEach((r, i) => { assert.equal(appelle('_creerCvNavIndex', r), i); assert.equal(appelle('_creerCvRouteParIndex', i), r); });
    assert.equal(appelle('_creerCvRouteParIndex', routes.length), null);
    assert.equal(appelle('_creerCvRouteParIndex', -1), null);
    assert.equal(etapes[etapes.length - 1].label, 'Vos documents');
  }));
});

test('l\'introduction du parcours et les remises à zéro voient les mêmes listes', () => {
  reglage(false, false);
  assert.strictEqual(appelle('_creerCvListeEtapes', false), ctx.CREER_CV_NAV_ETAPES);
  assert.strictEqual(appelle('_creerCvListeEtapes', true), ctx.CREER_CV_NAV_ETAPES_SANS);
  reglage(true, false);
  assert.strictEqual(appelle('_creerCvListeEtapes', false), ctx.CREER_CV_NAV_ETAPES_MC);
  assert.strictEqual(appelle('_creerCvListeEtapes', true), ctx.CREER_CV_NAV_ETAPES_SANS_MC);
  assert.equal(ctx.CREER_CV_NAV_LISTES.length, 4);
  const effaces = [];
  ctx._barreEtapesMaxAtteint = { delete: (l) => effaces.push(l) };
  appelle('_creerCvOublierProgressionBarre');
  ctx.CREER_CV_NAV_LISTES.forEach((l) => assert.ok(effaces.includes(l)));
});

test('js/app.js branche la route et les deux boutons voisins, et la page est chargée avant js/app.js', () => {
  const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
  assert.ok(app.includes("'missions-competences': pageMissionsCompetences"));
  assert.ok(app.includes("barreNavigation('projet', _creerCvRouteApresParcours(),"));
  assert.ok(app.includes('? _creerCvRouteAvantProfil() : \'projet\''));
  assert.ok(/\['objectif', 'votre-parcours', 'missions-competences', 'projet', 'revelation', 'assistant'\]/.test(app), 'la barre de progression connaît la route');
  const index = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
  const p = index.indexOf('modules/missions-competences/ui.js');
  assert.ok(p > index.indexOf('modules/missions-competences/etape.js') && p < index.indexOf('<script src="js/app.js"'));
});
