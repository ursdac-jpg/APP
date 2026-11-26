// « Mon plan » : le document imprimable et la rubrique de la feuille de « Ma synthèse » (consigne 618). Voir modules/mon-plan/document.js.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../modules/mon-plan/logique.js');
const D = require('../modules/mon-plan/document.js');

const SOURCES = {
  pas: { action: 'Appeler un atelier près de chez moi', qui: ['Mon conseiller'], parler: 'J’aimerais parler des façons d’essayer un métier manuel.' },
  papier: null,
  metiers: ['Menuisier ou menuisière']
};
function etatAvecPlan() {
  const e = L.mplEtatInitial();
  L.mplPoserVise(e, 'Un travail manuel <près> de chez moi.');
  L.mplAjouterObstacle(e, 'Je n’ai pas de voiture.');
  const r = L.mplAnalyserReponse('```json\n' + JSON.stringify({
    plan: 1, rappel: 'Vous avez indiqué viser un travail manuel.', priorites: ['Voir un atelier', 'Se déplacer'],
    semaines: [['Noter ce que je sais faire'], ['Lire une fiche'], [], ['Relire mes notes']],
    obstacles: [{ si: 'je n’ai pas de voiture', alors: 'je demande les aides au transport', frein: 'mobilite' }],
    parler: ['J’aimerais parler des aides pour me déplacer.'], fin: 'complet'
  }) + '\n```');
  assert.ok(r.ok, 'réponse fictive lisible');
  assert.ok(L.mplPoserPlan(e, r.parties, SOURCES, '2026-11-26'));
  return e;
}

test('dates : longue et courte en français, vide si la date est absente ou mal formée', () => {
  assert.equal(D.mplDateLongue('2026-11-26'), '26 novembre 2026');
  assert.equal(D.mplDateLongue('2026-03-01'), '1 mars 2026');
  assert.equal(D.mplDateCourte('2026-11-26'), '26/11/2026');
  assert.equal(D.mplDateLongue(''), '');
  assert.equal(D.mplDateCourte('26/11/2026'), '');
});

test('document : rien sans plan ; avec un plan, les rubriques, les semaines non vides, les cases cochées, échappé', () => {
  assert.equal(D.mplHtmlDocument(L.mplEtatInitial(), ''), '');
  const e = etatAvecPlan();
  L.mplCocherFait(e, 0, 0, true);
  const html = D.mplHtmlDocument(e, 'body{color:#000}');
  assert.match(html, /^<!DOCTYPE html><html lang="fr">/);
  assert.match(html, /body\{color:#000\}/);
  assert.match(html, /Établi le 26 novembre 2026/);
  ['Ce que j’ai indiqué', 'Mes priorités', 'Semaine 1', 'Semaine 2', 'Semaine 4', 'Si quelque chose me freine', 'Mon point de la semaine', 'Ce dont j’aimerais parler avec la personne qui m’accompagne']
    .forEach((t) => assert.ok(html.includes('<h2>' + t + '</h2>'), t));
  assert.ok(!html.includes('Semaine 3'), 'une semaine vide n’apparaît pas sur la feuille');
  assert.match(html, /<span class="case">✓<\/span>Appeler un atelier près de chez moi/, 'le petit pas en tête, coché');
  assert.match(html, /<span class="case"><\/span>Noter ce que je sais faire/);
  assert.match(html, /Si je n’ai pas de voiture, alors je demande les aides au transport\./);
  assert.ok(html.includes(D.MPL_DOC_PIED));
  assert.ok(!/[—–]/.test(html), 'jamais de tiret long');
  assert.ok(!/<près>/.test(html), 'rien n’est injecté tel quel');
});

test('feuille de « Ma synthèse » : seulement si le plan est joint, titres en h3, jamais la demande', () => {
  const e = etatAvecPlan();
  assert.equal(D.mplHtmlPartieSynthese(e), '', 'pas joint : rien');
  L.mplJoindre(e, true);
  const h = D.mplHtmlPartieSynthese(e);
  assert.match(h, /Plan que j’ai choisi de joindre, préparé le 26\/11\/2026/);
  assert.match(h, /<h3>Semaine 1<\/h3>/);
  assert.ok(!h.includes('<h2>'));
  assert.match(h, /<style>\.case\{/);
  assert.ok(!h.includes('{DONNEES}'));
  L.mplEffacerPlan(e);
  assert.equal(D.mplHtmlPartieSynthese(e), '', 'plan effacé : rien');
});

test('branchement : scripts chargés dans l’ordre, route et disquette déclarées, fermé au public', () => {
  const racine = path.join(__dirname, '..');
  const index = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
  const a = index.indexOf('modules/mon-plan/logique.js'), b = index.indexOf('modules/mon-plan/document.js'), c = index.indexOf('modules/mon-plan/index.js');
  assert.ok(a > 0 && a < b && b < c, 'logique, puis document, puis la page');
  assert.ok(index.indexOf('modules/ce-qui-compte/papierEcrans.js') < a);
  assert.ok(index.indexOf('modules/regard-exterieur/index.js') < c, 'les fiches des freins sont chargées avant');
  const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
  assert.match(app, /'mon-plan': typeof pageMonPlan === 'function'/);
  assert.match(app, /monPlan: typeof mplExporterEtatPourSauvegarde/);
  assert.match(app, /mplRestaurerEtatDepuisSauvegarde\(modulesEtat\.monPlan/);
  const lire = (...p) => fs.readFileSync(path.join(racine, ...p), 'utf8');
  assert.match(lire('modules', 'ce-qui-compte', 'index.js'), /mplHtmlBloc\('ce-qui-compte'\)/, 'le bloc dans « Ce qui compte pour moi »');
  assert.match(lire('modules', 'ce-qui-compte', 'ecrans.js'), /mplClicBloc\(ev, cqcpmRendre\)/);
  const vue = lire('modules', 'comprendre-les-metiers', 'syntheseVue.js');
  assert.match(vue, /mplHtmlBloc\(CMV_ROUTE\)/, 'le même bloc dans « Ma synthèse »');
  assert.match(vue, /mplClicBloc\(ev, cmvRendre\)/);
  const feuille = lire('modules', 'comprendre-les-metiers', 'syntheseFeuille.js');
  assert.ok(feuille.indexOf('mplHtmlPartieSynthese') > feuille.indexOf('Ce dont j’aimerais parler avec la personne qui m’accompagne</h2>'), 'la rubrique du plan vient en dernier sur la feuille');
  assert.ok(!/mon plan|quatre semaines/i.test(lire('prompts', 'ma-synthese.md')),'le plan n’est jamais dans la demande de « Ma synthèse »');
  const page = fs.readFileSync(path.join(racine, 'modules', 'mon-plan', 'index.js'), 'utf8');
  assert.match(page, /var MPL_OUVERT = true;/, 'ouvert au public depuis le 26/11/2026 (décision de Denis)');
  assert.ok(!/[—–]/.test(page), 'jamais de tiret long');
  assert.ok(!/\bIA\b/.test(page.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), 'jamais le mot visible');
});
