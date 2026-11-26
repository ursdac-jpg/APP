// Module « Bien utiliser l'IA », commit 1 : textes de l'écran d'entrée (data/buiaEntree.js) et logique pure (modules/bien-utiliser-ia/logique.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaEntree.js');
const L = require('../modules/bien-utiliser-ia/logique.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');

function tousLesTextes() {
  const t = [D.BUIA_NOM, D.BUIA_SOUS_TITRE, D.BUIA_EN_CONSTRUCTION];
  D.BUIA_CHEMINS.forEach((c) => t.push(c.titre, c.quand, c.texte, c.detail, c.bouton));
  D.BUIA_REASSURANCE.forEach((r) => t.push(r.titre, r.texte));
  return t;
}

test('quatre chemins, dans l\'ordre décidé : Comprendre, Comment il fonctionne, Mes modèles, Écrire', () => {
  assert.deepEqual(L.buiaChemins().map((c) => c.id), ['comprendre', 'fonctionne', 'modeles', 'ecrire']);
  assert.equal(L.buiaChemin('fonctionne').titre, 'Je veux savoir comment il fonctionne');
  assert.equal(L.buiaChemin('modeles').titre, 'J’ai un papier ou une situation');
  assert.equal(L.buiaChemin('inconnu'), null);
  L.buiaChemins().forEach((c) => { ['icone', 'titre', 'texte', 'detail', 'bouton'].forEach((k) => assert.ok(c[k] && c[k].length > 3, c.id + ' : ' + k)); });
});

test('aucun chemin n’est conseillé ni mis en avant : plus d’aide « Par où commencer ? », plus d’étiquette, plus de tuile qui s’allume (décision de Denis du 25/11/2026)', () => {
  ['BUIA_AIDE_PHRASES', 'BUIA_CONSEILS'].forEach((k) => { assert.ok(!(k in D), k + ' dans les données'); });
  ['buiaPhrasesAide', 'buiaCheminConseille', 'buiaTexteConseil'].forEach((k) => { assert.ok(!(k in L), k + ' dans la logique'); });
  const index = lire('modules/bien-utiliser-ia/index.js'), css = lire('modules/bien-utiliser-ia/bienUtiliserIa.css');
  assert.ok(!/Chemin conseillé|Par où commencer|buiaAide|data-buia-act="phrase"|buia-etiquette|conseille/.test(index.replace(/\/\*[\s\S]*?\*\//g, '')), 'index.js');
  assert.ok(!/\.conseille|\.buia-etiquette/.test(css), 'css');
});

test('chaque tuile porte sa phrase « Choisissez ce chemin si » : une phrase qui finit la tournure, écrite avec « vous »', () => {
  L.buiaChemins().forEach((c) => {
    assert.ok(c.quand && c.quand.length > 20, c.id + ' : phrase absente');
    assert.match(c.quand, /^vous /, c.id + ' : la phrase commence par « vous »');
    assert.match(c.quand, /\.$/, c.id + ' : la phrase finit par un point');
  });
  assert.match(L.buiaChemin('modeles').quand, /courrier/);
  assert.match(L.buiaChemin('ecrire').quand, /pas dans les modèles/);
  const index = lire('modules/bien-utiliser-ia/index.js');
  assert.ok(index.includes("<strong>Choisissez ce chemin si</strong>' + _buiaEsc(c.quand)"),'la phrase est posée sous le titre de chaque tuile');
  assert.ok(index.indexOf('c.titre') < index.indexOf('c.quand') && index.indexOf('c.quand') < index.indexOf('c.texte'), 'ordre : titre, phrase, texte');
});

test('trois messages de réassurance : aucune note, rien n\'est envoyé, vérifier la réponse', () => {
  const r = L.buiaReassurance();
  assert.equal(r.length, 3);
  assert.match(r[0].titre, /Aucune note/);
  assert.match(r[1].titre, /Rien n’est envoyé/);
  assert.match(r[2].titre, /Vérifiez/);
});

test('échappement : un texte venu d\'ailleurs ne casse jamais la page', () => {
  assert.equal(L._buiaEsc('<b>"a" & b</b>'), '&lt;b&gt;&quot;a&quot; &amp; b&lt;/b&gt;');
  assert.equal(L._buiaEsc(null), '');
  assert.equal(L._buiaEsc(undefined), '');
});

test('règles de texte : pas de tiret long, pas de « on », pas de « facultatif », pas de « prompt » visible, pas de mot de robot', () => {
  tousLesTextes().forEach((t) => {
    assert.ok(!/[–—]/.test(t), 'tiret long : ' + t);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(t), 'mot « on » : ' + t);
    assert.ok(!/facultatif/i.test(t), 'facultatif : ' + t);
    assert.ok(!/prompt/i.test(t), '« prompt » est réservé au Lexique : ' + t);
    assert.ok(!/robot/i.test(t), 'robot : ' + t);
    assert.ok(!/ChatGPT|Mistral|Gemini|Copilot|Perplexity/.test(t), 'nom d\'outil : ' + t);
  });
  assert.ok(!/[–—]/.test(lire('modules/bien-utiliser-ia/index.js').replace(/\/\*[\s\S]*?\*\//g, '')), 'tiret long dans index.js');
});

test('le nom du module garde le mot « IA » (dérogation du 22/11/2026), et seulement lui parmi les textes de l\'écran', () => {
  assert.equal(D.BUIA_NOM, 'Bien utiliser l’IA');
  const autres = tousLesTextes().filter((t) => t !== D.BUIA_NOM);
  autres.forEach((t) => assert.ok(!/\bIA\b/.test(t), 'IA dans : ' + t));
});

test('apostrophes typographiques et accents : aucun texte ne contient l\'apostrophe droite', () => {
  tousLesTextes().forEach((t) => assert.ok(!/'/.test(t), 'apostrophe droite : ' + t));
});

test('branchement : scripts, feuille de style, routes, tuile, bouton, aide et recherche existent', () => {
  const html = lire('index.html');
  ['data/buiaEntree.js', 'modules/bien-utiliser-ia/logique.js', 'modules/bien-utiliser-ia/index.js'].forEach((s) => {
    assert.ok(html.includes('src="' + s + '"'), s);
    assert.ok(fs.existsSync(path.join(racine, s)), s);
  });
  // les textes de l'entrée sont chargés avant la logique, la logique avant la page
  assert.ok(html.indexOf('data/buiaEntree.js') < html.indexOf('modules/bien-utiliser-ia/logique.js'));
  assert.ok(html.indexOf('modules/bien-utiliser-ia/logique.js') < html.indexOf('modules/bien-utiliser-ia/index.js'));
  assert.ok(html.includes('modules/bien-utiliser-ia/bienUtiliserIa.css') && fs.existsSync(path.join(racine, 'modules/bien-utiliser-ia/bienUtiliserIa.css')));
  const app = lire('js/app.js');
  assert.ok(app.includes("'bien-utiliser-ia-intro': typeof pageIntroBienUtiliserIa"));
  assert.ok(app.includes("'bien-utiliser-ia': typeof pageBienUtiliserIa"));
  assert.ok(app.includes("AIDE_PAGES['bien-utiliser-ia-intro']") && app.includes("AIDE_PAGES['bien-utiliser-ia']"));
  const metiers = lire('data/metiers.js');
  assert.ok(metiers.includes("btnCarteAccueilBienUtiliserIa"));
  assert.ok(metiers.includes("naviguerVers('bien-utiliser-ia-intro')"));
  const recherche = lire('data/baseConnaissancesERIP.js');
  assert.ok(recherche.includes("cible: 'route:bien-utiliser-ia-intro', ouvertSi: 'buiaOuvert'"));
});

test('le module est ouvert au public (25/11/2026) : l\'interrupteur est à true et la ligne « Nouveautés » existe', () => {
  const src = lire('modules/bien-utiliser-ia/index.js');
  assert.match(src, /var BUIA_OUVERT = true;/);
  assert.ok(/module: 'Bien utiliser l’IA'/.test(lire('data/nouveautes.js')), 'nouveautés : une ligne pour le module ouvert');
});
