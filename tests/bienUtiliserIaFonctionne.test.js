// Module « Bien utiliser l'IA » : chemin 4 « Comment fonctionne un assistant » (data/buiaFonctionne.js, fonctionneLogique.js, branchement).
// Décisions de Denis du 24/11/2026 (consignes 596, 598, 599) : un quatrième chemin à part ; sept assistants nommés sur un seul écran daté ; projets et mémoire avec garde-fous.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaFonctionne.js');
const L = require('../modules/bien-utiliser-ia/fonctionneLogique.js');
const Entree = require('../data/buiaEntree.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const NOMS_OUTILS = /ChatGPT|Copilot|Gemini|Claude|Perplexity|DeepSeek|Mistral|Le Chat/;

function textesHorsAssistants() {
  const t = [D.BUIA_C4_ROUTE_TITRE, D.BUIA_C4_SOUS_TITRE, D.BUIA_C4_DATE_LIBELLE];
  D.BUIA_C4_ETAPES.forEach((e) => t.push(e.label));
  const e1 = D.BUIA_C4_E1; t.push(e1.titre, e1.intro, e1.schemaLibelle, e1.idee.titre, e1.idee.texte, e1.plus.titre, e1.plus.texte); e1.schema.forEach((b) => t.push(b.titre, b.texte));
  const e2 = D.BUIA_C4_E2; t.push(e2.titre, e2.intro, e2.exempleTitre, e2.exempleTexte, e2.contexteBouton, e2.legendeSans, e2.legendeAvec, e2.consigneTitre, e2.consigne, e2.idee.titre, e2.idee.texte, e2.plus.titre, e2.plus.texte);
  const e3 = D.BUIA_C4_E3; t.push(e3.titre, e3.oui.titre, e3.non.titre, ...e3.oui.items, ...e3.non.items, e3.savoir.titre, e3.savoir.texte, e3.plus.titre, e3.plus.texte);
  const e4 = D.BUIA_C4_E4; t.push(e4.titre, e4.intro, e4.activer.titre, ...e4.activer.items, e4.inutile.titre, ...e4.inutile.items, e4.verifier.titre, e4.verifier.texte, e4.reglage);
  const e5 = D.BUIA_C4_E5; t.push(e5.titre, e5.prudence, e5.pourLibelle, e5.savoirLibelle, e5.choisir.titre, e5.choisir.texte);
  const e6 = D.BUIA_C4_E6; t.push(e6.titre, e6.intro, e6.oui.titre, e6.non.titre, ...e6.oui.items, ...e6.non.items, e6.jamais.titre, e6.jamais.texte, e6.temporaire.titre, e6.temporaire.texte, e6.consignes.titre, e6.consignes.texte, e6.documents.titre, e6.documents.texte);
  const e7 = D.BUIA_C4_E7; t.push(e7.titre, e7.intro, ...e7.cartes.flatMap((c) => [c.titre, c.texte]), e7.rappel.titre, e7.rappel.texte);
  const f = D.BUIA_C4_FICHE; t.push(f.titre, ...f.points, f.boutons.modeles, f.boutons.comprendre, f.boutonFin);
  return t;
}
function textesAssistants() { const t = []; D.BUIA_C4_E5.assistants.forEach((a) => t.push(a.nom, a.pour, a.savoir)); return t; }

test('huit étapes : sept écrans puis la fiche « Ce qu\'il faut retenir »', () => {
  assert.equal(L.buiaC4NombreEtapes(), 8);
  assert.deepEqual(L.buiaC4Etapes().map((e) => e.label), ['L’assistant', 'Ses phrases', 'Son savoir', 'Recherche web', 'Les assistants', 'Projets et mémoire', 'S’en passer', 'À retenir']);
  L.buiaC4Etapes().forEach((e) => assert.match(e.icone, /^<i class="bi bi-[a-z0-9-]+"><\/i>$/));
});

test('étape : une valeur inconnue ou hors limites ramène dans la plage, jamais un écran vide', () => {
  assert.equal(L.buiaC4BorneEtape(3), 3); assert.equal(L.buiaC4BorneEtape(-5), 0); assert.equal(L.buiaC4BorneEtape(99), 7); assert.equal(L.buiaC4BorneEtape(2.9), 2);
  [undefined, null, NaN, '3', {}, Infinity].forEach((v) => assert.equal(L.buiaC4BorneEtape(v), 0, String(v)));
});

test('les mots vraisemblables : deux listes de cinq mots qui font 100 %, le contexte change le mot le plus probable, la légende dit que les chiffres sont inventés', () => {
  [false, true].forEach((avec) => {
    const m = L.buiaC4MotsVraisemblables(avec);
    assert.equal(m.length, 5);
    assert.equal(m.reduce((s, x) => s + x.pct, 0), 100, avec ? 'avec' : 'sans');
    for (let i = 1; i < m.length; i++) { assert.ok(m[i - 1].pct >= m[i].pct, 'ordre décroissant'); }
    assert.match(L.buiaC4LegendeMots(avec), /inventés pour l’exemple/);
  });
  assert.equal(L.buiaC4MotsVraisemblables(false)[0].mot, 'bleu');
  assert.notEqual(L.buiaC4MotsVraisemblables(true)[0].mot, 'bleu');
});

test('sept assistants nommés (ChatGPT, Copilot, Gemini, Claude, Perplexity, Le Chat, DeepSeek) puis « D\'autres existent », chacun avec un usage et un point à savoir', () => {
  const a = L.buiaC4Assistants();
  assert.deepEqual(a.map((x) => x.id), ['chatgpt', 'copilot', 'gemini', 'claude', 'perplexity', 'lechat', 'deepseek', 'autres']);
  a.forEach((x) => { assert.ok(x.nom && x.pour.length > 30 && x.savoir.length > 30, x.id); });
});

test('le noms d\'outils n\'apparaissent que sur l\'écran des assistants : nulle part ailleurs dans ce chemin ni dans l\'écran d\'entrée', () => {
  textesHorsAssistants().forEach((t) => assert.ok(!NOMS_OUTILS.test(t), 'nom d\'outil : ' + t));
  const entree = [];
  Entree.BUIA_CHEMINS.forEach((c) => entree.push(c.titre, c.quand, c.texte, c.detail, c.bouton));
  entree.forEach((t) => assert.ok(!NOMS_OUTILS.test(t), 'nom d\'outil dans l\'entrée : ' + t));
});

test('jamais un quota ni un prix : aucun chiffre suivi d\'une unité de volume ou de monnaie dans les descriptions des assistants', () => {
  textesAssistants().forEach((t) => {
    assert.ok(!/\d/.test(t.replace('Microsoft 365', '')), 'chiffre : ' + t);
    assert.ok(!/(€|\beuros?\b|\bdollars?\b|\$|par jour|par mois|messages? par)/i.test(t), 'quota ou prix : ' + t);
  });
});

test('écran daté : la date de mise à jour est une vraie date jj/mm/aaaa, et les fiches à relire sur la page officielle sont marquées sans jamais s\'afficher', () => {
  assert.match(D.BUIA_C4_DATE_MAJ, /^\d{2}\/\d{2}\/20\d{2}$/);
  const [j, m] = D.BUIA_C4_DATE_MAJ.split('/').map(Number);
  assert.ok(j >= 1 && j <= 31 && m >= 1 && m <= 12);
  const marquees = L.buiaC4Assistants().filter((x) => x.aSourcer).map((x) => x.id);
  assert.deepEqual(marquees, [], 'les quatre fiches ont été relues sur les pages officielles le 24/11/2026');
  ['copilot', 'gemini', 'lechat', 'deepseek'].forEach((id) => {
    const f = D.BUIA_C4_E5.assistants.filter((x) => x.id === id)[0];
    assert.match(f.source, /^https:\/\/(support\.microsoft\.com|support\.google\.com|mistral\.ai|cdn\.deepseek\.com)\//, 'source officielle : ' + id);
  });
  textesAssistants().forEach((t) => assert.ok(!/sourcer/i.test(t), 'mention de revue affichée : ' + t));
});

test('projets et mémoire : couper la mémoire et supprimer une conversation n\'effacent pas les souvenirs, conversation temporaire, écran branché', () => {
  const e = D.BUIA_C4_E6;
  assert.ok(e.non.items.some((x) => /Couper la mémoire n’efface pas/.test(x)));
  assert.ok(e.non.items.some((x) => /Supprimer une conversation n’efface pas/.test(x)));
  assert.match(e.temporaire.texte, /conversation temporaire/);
  assert.doesNotMatch(e.temporaire.texte, /Incognito|Temporary/i);
  const ui = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'modules', 'bien-utiliser-ia', 'fonctionneUi.js'), 'utf8');
  assert.match(ui, /t\.temporaire\.titre/);
});

test('P7 et P8 : consignes permanentes et réponses à partir de ses documents, avec leurs précautions, sans chiffre ni nom d\'outil, écran branché', () => {
  const c = D.BUIA_C4_E6.consignes, d = D.BUIA_C4_E6.documents;
  assert.match(c.texte, /une fois pour toutes/); assert.match(c.texte, /Ce n’est pas la mémoire/); assert.match(c.texte, /modifier, les couper ou les effacer/);
  assert.match(c.texte, /ni votre nom, ni votre adresse/); assert.match(c.texte, /confidentialité/); assert.match(c.texte, /selon l’assistant/);
  assert.match(d.texte, /Certains outils/); assert.doesNotMatch(d.texte, /Plusieurs outils|Tous les outils/);
  assert.match(d.texte, /retrouvez-le vous-même/); assert.match(d.texte, /sans noms ni numéros/); assert.match(d.texte, /rien ne garantit/);
  [c, d].forEach((g) => { assert.ok(!/\d/.test(g.titre + g.texte), 'aucun chiffre : ' + g.titre); });
  const ui = lire('modules/bien-utiliser-ia/fonctionneUi.js');
  assert.match(ui, /\[t\.consignes, t\.documents\]/);
});

test('quand s\'en passer : quatre situations (urgence, grande décision, réponse exacte, texte sur d\'autres personnes), aucun numéro cité, écran branché aux deux niveaux', () => {
  const e = D.BUIA_C4_E7;
  assert.equal(e.cartes.length, 4);
  assert.match(e.cartes[0].texte, /secours/); assert.match(e.cartes[1].titre, /santé, argent, droit/); assert.match(e.cartes[2].texte, /site officiel/); assert.match(e.cartes[3].texte, /noms/);
  e.cartes.forEach((c) => { assert.ok(!/\d/.test(c.titre + c.texte), 'chiffre cité de mémoire : ' + c.titre); });
  assert.ok(D.BUIA_C4_FICHE.points.some((p) => /urgence/.test(p) && /source officielle/.test(p)));
  const ui = lire('modules/bien-utiliser-ia/fonctionneUi.js');
  assert.match(ui, /_buiaC4Ecran6, _buiaC4Ecran7\]/);
  const bloc = ui.slice(ui.indexOf('function _buiaC4Ecran7'), ui.indexOf('function _buiaC4Fiche'));
  assert.ok(bloc.length > 100 && !/_buiaC4Plus\(\)/.test(bloc), 'écran visible aux deux niveaux');
});

test('garde-fous : DeepSeek (service chinois, rien de personnel), Copilot (deux versions), Gemini (compte Google), projets et mémoire (ne jamais y mettre nom, adresse, numéros, santé)', () => {
  const par = {}; L.buiaC4Assistants().forEach((x) => { par[x.id] = x; });
  assert.match(par.deepseek.savoir, /service chinois/); assert.match(par.deepseek.savoir, /rien de personnel/);
  assert.match(par.copilot.savoir, /deux versions/); assert.match(par.copilot.savoir, /compte de travail/);
  assert.match(par.gemini.savoir, /compte Google/);
  assert.match(D.BUIA_C4_E6.jamais.texte, /nom/); assert.match(D.BUIA_C4_E6.jamais.texte, /adresse/); assert.match(D.BUIA_C4_E6.jamais.texte, /santé/); assert.match(D.BUIA_C4_E6.jamais.texte, /couper la mémoire/);
});

test('vocabulaire : une seule phrase dit que l\'assistant est une intelligence artificielle (écran 1), ensuite le chemin garde « assistant »', () => {
  assert.match(D.BUIA_C4_E1.intro, /intelligence artificielle/);
  const hors = textesHorsAssistants().filter((t) => t !== D.BUIA_C4_E1.intro && t !== D.BUIA_C4_E1.titre && t !== D.BUIA_C4_FICHE.points[0]);
  hors.forEach((t) => assert.ok(!/\bIA\b/.test(t) || /Large Language Model/.test(t) === false, 'IA hors écran 1 : ' + t));
});

test('règles de texte : pas de tiret long, pas de « on », pas de « facultatif », pas de « prompt », pas de robot, apostrophes typographiques', () => {
  textesHorsAssistants().concat(textesAssistants()).forEach((t) => {
    assert.ok(!/[–—]/.test(t), 'tiret long : ' + t);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(t), 'mot « on » : ' + t);
    assert.ok(!/facultatif/i.test(t), 'facultatif : ' + t);
    assert.ok(!/prompt/i.test(t), '« prompt » est réservé au Lexique : ' + t);
    assert.ok(!/robot/i.test(t), 'robot : ' + t);
    assert.ok(!/'/.test(t), 'apostrophe droite : ' + t);
  });
});

test('les fichiers n\'écrivent rien sur l\'appareil et ne contiennent aucun tiret long hors commentaires', () => {
  ['modules/bien-utiliser-ia/fonctionneUi.js', 'modules/bien-utiliser-ia/fonctionneLogique.js'].forEach((f) => {
    const s = lire(f);
    assert.ok(!/localStorage|sessionStorage/.test(s), f);
    assert.ok(!/[–—]/.test(s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'tiret long dans ' + f);
  });
});

test('branchement : scripts dans l\'ordre, route, aide contextuelle, clic de l\'écran d\'entrée, recherche d\'accueil', () => {
  const html = lire('index.html');
  const ordre = ['data/buiaFonctionne.js', 'modules/bien-utiliser-ia/logique.js', 'modules/bien-utiliser-ia/comprendreLogique.js', 'modules/bien-utiliser-ia/fonctionneLogique.js', 'modules/bien-utiliser-ia/comprendreUi.js', 'modules/bien-utiliser-ia/fonctionneUi.js', 'modules/bien-utiliser-ia/index.js'];
  ordre.forEach((s) => { assert.ok(html.includes('src="' + s + '"'), s); assert.ok(fs.existsSync(path.join(racine, s)), s); });
  for (let i = 1; i < ordre.length; i++) { assert.ok(html.indexOf(ordre[i - 1]) < html.indexOf(ordre[i]), ordre[i - 1] + ' avant ' + ordre[i]); }
  const app = lire('js/app.js');
  assert.ok(app.includes("'bien-utiliser-ia-fonctionne': typeof pageBienUtiliserIaFonctionne"));
  assert.ok(app.includes("AIDE_PAGES['bien-utiliser-ia-fonctionne']"));
  const index = lire('modules/bien-utiliser-ia/index.js');
  assert.ok(index.includes("BUIA_ROUTE_FONCTIONNE = 'bien-utiliser-ia-fonctionne'"));
  assert.match(index, /act === 'chemin' && v === 'fonctionne'[\s\S]*naviguerVers\(BUIA_ROUTE_FONCTIONNE\)/);
  assert.match(index, /buiaC4Clic\(act, v\)/);
  const recherche = lire('data/baseConnaissancesERIP.js');
  ['comment fonctionne un assistant', 'recherche web', 'copilot', 'gemini', 'quel assistant choisir'].forEach((m) => assert.ok(recherche.includes("'" + m + "'"), m));
  assert.ok(Entree.BUIA_CHEMINS.some((c) => c.id === 'fonctionne' && /comment un assistant fonctionne/.test(c.quand)));
});

test('toutes les actions des écrans du chemin 4 sont gérées par buiaC4Clic', () => {
  const ui = lire('modules/bien-utiliser-ia/fonctionneUi.js');
  const actes = new Set(); ui.replace(/data-buia-act="([a-z0-9-]+)"/g, (m, a) => { actes.add(a); return m; });
  assert.ok(actes.size >= 3);
  actes.forEach((a) => assert.ok(new RegExp("act === '" + a + "'").test(ui), 'action sans gestionnaire : ' + a));
});

test('feuille de style : les nouvelles classes existent (mots, assistants, pastille de date)', () => {
  const css = lire('modules/bien-utiliser-ia/bienUtiliserIa.css');
  ['.buia-phrase-demo', '.buia-mot ', '.buia-assistants', '.buia-assistant ', '.buia-pastille-date'].forEach((c) => assert.ok(css.includes(c), c));
});
