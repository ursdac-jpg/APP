// Module « Bien utiliser l'IA », décision C du 24/11/2026 : propositions P11 (questions à poser à sa structure) et P12 (grille d'essai),
// affichées dans la famille « Pour les professionnels » du chemin 2 (data/buiaModelesTextes.js, modules/bien-utiliser-ia/modelesUi.js non chargé par les tests).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const T = require('../data/buiaModelesTextes.js');
const M = require('../data/buiaModeles.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const pro = T.BUIA_C2_E1.pro;

function collecter(o, sortie) {
  if (typeof o === 'string') { sortie.push(o); } else if (Array.isArray(o)) { o.forEach((x) => collecter(x, sortie)); } else if (o && typeof o === 'object') { Object.keys(o).forEach((k) => collecter(o[k], sortie)); }
  return sortie;
}

test('P11 : six questions, toutes des questions, jamais une règle écrite à la place de la structure', () => {
  assert.equal(pro.questions.liste.length, 6);
  pro.questions.liste.forEach((q) => assert.match(q, /\?$/, q));
  assert.match(pro.questions.intro, /l’application n’en donne aucune à sa place/);
  ['autorise', 'informations', 'vérifie', 'conserver'].forEach((m) => assert.ok(pro.questions.liste.some((q) => q.includes(m)), m));
});

test('P12 : une grille de relecture, des cas inventés (les courriers fictifs existent), une note de version, sans impression', () => {
  assert.equal(pro.grille.relecture.length, 5);
  assert.match(pro.grille.cas, /courriers fictifs/);
  assert.equal(Object.keys(M.BUIA_COURRIERS_FICTIFS).length, 3);
  assert.match(pro.grille.noter, /nom de l’assistant/); assert.match(pro.grille.noter, /date de l’essai/);
  assert.match(pro.grille.reserve, /recopier/);
  assert.doesNotMatch(collecter(pro, []).join(' '), /imprim/i);
});

test('P11 et P12 : mêmes règles de texte que le chemin 2 (pas de tiret long, de « on », de prompt, de mot IA, d’apostrophe droite)', () => {
  const textes = collecter(pro, []);
  assert.ok(textes.length > 15);
  textes.forEach((x) => {
    assert.ok(!/[–—]/.test(x), 'tiret long : ' + x);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(x), '« on » : ' + x);
    assert.ok(!/prompt/i.test(x), 'prompt : ' + x);
    assert.ok(!/\bIA\b/.test(x), 'IA : ' + x);
    assert.ok(!/'/.test(x), 'apostrophe droite : ' + x);
    assert.ok(!/bravo|félicitations/i.test(x), x);
  });
});

test('P11 et P12 : affichés seulement dans la famille des professionnels, sans stockage ni envoi', () => {
  const ui = lire('modules/bien-utiliser-ia/modelesUi.js');
  assert.match(ui, /function _buiaC2HtmlPro\(/);
  assert.match(ui, /\(pro \? _buiaC2HtmlPro\(\) : ''\)/);
  const corps = ui.slice(ui.indexOf('function _buiaC2HtmlPro('), ui.indexOf('function _buiaC2Ecran1('));
  assert.doesNotMatch(corps, /localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
  assert.ok(M.BUIA_FAMILLES.includes('Pour les professionnels'));
});
