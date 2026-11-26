// Module « Bien utiliser l'IA » : exercices du chemin 1 « Réparer une demande » et « Repérer ce qui se vérifie »
// (data/buiaExercices.js, exercicesLogique.js, exercicesUi.js, branchement). Option 1 choisie par Denis le 24/11/2026 (propositions P1 et P2).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaExercices.js');
const E = require('../data/buiaDemande.js');
const L = require('../modules/bien-utiliser-ia/exercicesLogique.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const IDS = E.BUIA_ELEMENTS.map((e) => e.id);

function tousLesTextes() {
  const t = [];
  const x1 = D.BUIA_EX1;
  t.push(x1.titre, x1.consigne, x1.demandeEtiquette, x1.resultatTitre, x1.repareeTitre, x1.rappel.titre, x1.rappel.texte, ...Object.values(x1.questions), ...Object.values(x1.etats), ...Object.values(x1.boutons));
  x1.cas.forEach((c) => { t.push(c.histoire, c.demande); IDS.forEach((id) => { t.push(c.elements[id].raison); if (c.elements[id].phrase) { t.push(c.elements[id].phrase); } }); });
  const x2 = D.BUIA_EX2;
  t.push(x2.titre, x2.consigne, x2.reponseEtiquette, x2.bilanTitre, x2.bilanTexte, x2.astuceTitre, x2.astuceTexte, ...Object.values(x2.boutons));
  x2.cas.forEach((c) => { t.push(c.histoire); c.phrases.forEach((p) => t.push(p.texte, p.tag)); });
  const x3 = D.BUIA_EX3;
  t.push(x3.titre, x3.consigne, x3.demandeTitre, x3.reponseTitre, x3.legende, x3.exemple.titre, x3.exemple.texte, x3.autre, ...Object.values(x3.boutons));
  x3.cas.forEach((c) => { t.push(c.histoire); ['vague', 'precise'].forEach((v) => { c[v].demande.forEach((m) => t.push(m.texte)); t.push(...c[v].reponse, c[v].note); }); });
  return t;
}

test('exercice 1 : deux cas, chacun avec les six éléments de la liste unique, une raison pour chacun, une phrase pour chaque élément utile', () => {
  assert.equal(L.buiaEx1NombreCas(), 2);
  D.BUIA_EX1.cas.forEach((c) => {
    assert.deepEqual(Object.keys(c.elements).sort(), IDS.slice().sort(), c.id);
    IDS.forEach((id) => {
      const el = c.elements[id];
      assert.ok(el.raison.length > 20, c.id + ' ' + id);
      if (el.utile) { assert.ok(el.phrase.length > 10, 'phrase : ' + c.id + ' ' + id); } else { assert.equal(el.phrase, '', 'pas de phrase pour un élément inutile : ' + c.id + ' ' + id); }
    });
    assert.ok(IDS.filter((id) => c.elements[id].utile).length >= 5, 'au moins cinq éléments utiles : ' + c.id);
  });
  assert.ok(D.BUIA_EX1.cas.some((c) => IDS.some((id) => !c.elements[id].utile)), 'un cas montre un élément pas nécessaire (la liste ne dit pas toujours « tout »)');
  assert.ok(D.BUIA_EX1.cas.some((c) => c.elements.texte.utile), 'un cas où le texte à traiter est utile');
});

test('exercice 1 : avant la correction rien n\'est jugé ; après, « vu », « à ajouter » ou « pas nécessaire », sans reproche', () => {
  const avant = L.buiaEx1Lignes(0, { but: true }, false);
  assert.equal(avant.length, 6);
  avant.forEach((l) => { assert.equal(l.etat, 'neutre'); assert.equal(l.raison, ''); });
  assert.equal(avant[0].cochee, true); assert.equal(avant[1].cochee, false);
  const apres = L.buiaEx1Lignes(0, { but: true, texte: true }, true);
  assert.equal(apres.find((l) => l.id === 'but').etat, 'vu');
  assert.equal(apres.find((l) => l.id === 'situation').etat, 'ajouter');
  assert.equal(apres.find((l) => l.id === 'texte').etat, 'inutile', 'coché ou non, un élément inutile n\'est jamais reproché');
  assert.equal(L.buiaEx1Lignes(0, {}, true).find((l) => l.id === 'texte').etat, 'inutile');
  apres.forEach((l) => assert.ok(l.raison.length > 0));
  assert.deepEqual(apres.map((l) => l.n), [1, 2, 3, 4, 5, 6]);
  apres.forEach((l, i) => assert.equal(l.nom, E.BUIA_ELEMENTS[i].nom, 'les noms viennent de la liste unique'));
});

test('exercice 1 : la demande réparée contient un bloc par élément utile, dans l\'ordre des six éléments', () => {
  const r0 = L.buiaEx1Reparee(0), r1 = L.buiaEx1Reparee(1);
  assert.equal(r0.length, 5); assert.equal(r1.length, 6);
  assert.deepEqual(r0.map((b) => b.n), [1, 2, 4, 5, 6]);
  assert.deepEqual(r1.map((b) => b.n), [1, 2, 3, 4, 5, 6]);
  r0.concat(r1).forEach((b) => assert.ok(b.phrase.length > 10));
});

test('exercice 2 : deux cas de six phrases, chacun avec au moins une phrase à vérifier et une phrase sans rien à vérifier, une étiquette pour chaque phrase', () => {
  assert.equal(L.buiaEx2NombreCas(), 2);
  D.BUIA_EX2.cas.forEach((c) => {
    assert.equal(c.phrases.length, 6, c.id);
    assert.ok(c.phrases.some((p) => p.verif) && c.phrases.some((p) => !p.verif), c.id);
    c.phrases.forEach((p) => { assert.ok(p.texte.length > 20 && p.tag.length > 5, c.id + ' ' + p.texte); });
    assert.ok(c.phrases.some((p) => /règle citée avec une année/.test(p.tag)), 'une règle citée avec une année : ' + c.id);
    assert.match(c.histoire, /inventé/, 'le cas dit qu\'il est inventé : ' + c.id);
  });
});

test('exercice 2 : avant la correction rien n\'est jugé, après chaque phrase dit si elle contient un fait à vérifier ; ce qui a été touché ne compte dans aucun résultat', () => {
  const avant = L.buiaEx2Phrases(0, { 1: true, 5: true }, false);
  avant.forEach((p) => { assert.equal(p.etat, 'neutre'); assert.equal(p.tag, ''); });
  assert.equal(avant[1].choisie, true); assert.equal(avant[0].choisie, false);
  const apres = L.buiaEx2Phrases(0, { 5: true }, true);
  assert.equal(apres[5].etat, 'rien'); assert.equal(apres[5].choisie, true);
  assert.equal(apres[1].etat, 'verif');
  apres.forEach((p) => assert.ok(p.tag.length > 0));
  const sansChoix = L.buiaEx2Phrases(0, {}, true), avecTout = L.buiaEx2Phrases(0, { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true }, true);
  assert.deepEqual(sansChoix.map((p) => p.etat), avecTout.map((p) => p.etat), 'aucun score : l\'état ne dépend pas de ce qui a été touché');
});

test('exercice 3 : deux cas, chacun avec une demande rapide et une demande précisée, une réponse et une note pour chaque ; cas inventés', () => {
  assert.equal(L.buiaEx3NombreCas(), 2);
  D.BUIA_EX3.cas.forEach((c) => {
    assert.match(c.histoire, /inventée/, 'le cas dit qu\'il est inventé : ' + c.id);
    ['vague', 'precise'].forEach((v) => { assert.ok(c[v].demande.length > 0 && c[v].reponse.length >= 4 && c[v].note.length > 30, c.id + ' ' + v); });
    assert.equal(c.vague.demande.length, 1, 'la demande rapide est une seule phrase : ' + c.id);
    assert.ok(c.vague.demande[0].id === null);
    assert.ok(c.precise.reponse.length > c.vague.reponse.length - 1, 'la réponse à la demande précisée est au moins aussi complète : ' + c.id);
  });
});

test('exercice 3 : la demande précisée est découpée selon les éléments de la liste unique (nom et numéro viennent de data/buiaDemande.js)', () => {
  D.BUIA_EX3.cas.forEach((c, i) => {
    const a = L.buiaEx3Affichage(i, 'precise');
    assert.equal(a.vue, 'precise');
    assert.deepEqual(c.precise.demande.map((m) => m.id), ['situation', 'but', 'attente', 'interdit']);
    a.demande.forEach((m, k) => {
      const e = E.BUIA_ELEMENTS.find((x) => x.id === c.precise.demande[k].id);
      assert.equal(m.n, e.n); assert.equal(m.nom, e.nom);
    });
    const r = L.buiaEx3Affichage(i, 'vague');
    assert.equal(r.demande.length, 1); assert.equal(r.demande[0].n, 0); assert.equal(r.demande[0].nom, '');
    assert.notDeepEqual(r.reponse, a.reponse);
  });
});

test('exercice 3 : une valeur inconnue ramène à la demande rapide, jamais un écran vide ; la réponse affichée est une copie', () => {
  [undefined, null, 'x', 3, {}].forEach((v) => { assert.equal(L.buiaEx3Vue(v), 'vague'); assert.equal(L.buiaEx3Affichage(0, v).vue, 'vague'); });
  assert.equal(L.buiaEx3Vue('precise'), 'precise');
  assert.equal(L.buiaEx3CasSuivant(0), 1); assert.equal(L.buiaEx3CasSuivant(1), 0);
  [undefined, null, NaN, '1', {}, Infinity, -3, 7.5].forEach((v) => { assert.ok(L.buiaEx3Cas(v)); assert.ok(L.buiaEx3Affichage(v, 'precise').reponse.length > 0); });
  const a = L.buiaEx3Affichage(0, 'precise'); a.reponse.push('x');
  assert.ok(!D.BUIA_EX3.cas[0].precise.reponse.includes('x'));
});

test('autre cas : passe au suivant et revient au premier ; une valeur inconnue ne casse rien', () => {
  assert.equal(L.buiaEx1CasSuivant(0), 1); assert.equal(L.buiaEx1CasSuivant(1), 0);
  assert.equal(L.buiaEx2CasSuivant(0), 1); assert.equal(L.buiaEx2CasSuivant(1), 0);
  [undefined, null, NaN, '1', {}, Infinity, -3, 7.5].forEach((v) => {
    assert.ok(L.buiaEx1Cas(v) && L.buiaEx2Cas(v), String(v));
    assert.equal(L.buiaEx1Lignes(v, null, true).length, 6);
    assert.equal(L.buiaEx2Phrases(v, null, true).length, 6);
  });
  assert.equal(L.buiaEx1Cas(-1), D.BUIA_EX1.cas[1]);
});

test('état vierge : jamais partagé entre deux appels', () => {
  const a = L.buiaExVierge(), b = L.buiaExVierge();
  a.ex1.coches.but = true; a.ex2.sel[0] = true;
  assert.deepEqual(b.ex1.coches, {}); assert.deepEqual(b.ex2.sel, {});
  assert.equal(a.ex1.corrige, false); assert.equal(a.ex1.repare, false); assert.equal(a.ex2.corrige, false);
  a.ex3.vue = 'precise'; assert.deepEqual(b.ex3, { cas: 0, vue: 'vague' });
});

test('une seule source de vérité : les noms des six éléments ne sont recopiés ni dans les données ni dans la logique des exercices', () => {
  const src = lire('data/buiaExercices.js') + lire('modules/bien-utiliser-ia/exercicesLogique.js') + lire('modules/bien-utiliser-ia/exercicesUi.js');
  E.BUIA_ELEMENTS.forEach((e) => { assert.ok(!src.includes(e.nom), 'nom recopié : ' + e.nom); });
});

test('règles de texte : pas de tiret long, de « on », de « facultatif », de mot IA, de « prompt », de robot, de nom d\'outil, de félicitations ni de score ; apostrophes typographiques', () => {
  tousLesTextes().forEach((t) => {
    assert.equal(typeof t, 'string'); assert.ok(t.length > 0);
    assert.ok(!/[–—]/.test(t), 'tiret long : ' + t);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(t), 'mot « on » : ' + t);
    assert.ok(!/facultatif/i.test(t), 'facultatif : ' + t);
    assert.ok(!/\bIA\b/.test(t), 'IA : ' + t);
    assert.ok(!/prompt/i.test(t), 'prompt : ' + t);
    assert.ok(!/robot/i.test(t), 'robot : ' + t);
    assert.ok(!/ChatGPT|Mistral|Gemini|Copilot|Perplexity|Claude|DeepSeek/.test(t), 'nom d\'outil : ' + t);
    assert.ok(!/bravo|félicitations|score|bonne réponse|mauvaise réponse|niveau insuffisant|diagnostic/i.test(t.replace('Il n’y a pas de mauvaise réponse', '')), 'jugement : ' + t);
    assert.ok(!/'/.test(t), 'apostrophe droite : ' + t);
    assert.ok(!/\.\.\./.test(t), 'points de suspension : ' + t);
  });
});

test('les fichiers n\'écrivent rien sur l\'appareil et ne contiennent aucun tiret long hors commentaires', () => {
  ['data/buiaExercices.js', 'modules/bien-utiliser-ia/exercicesLogique.js', 'modules/bien-utiliser-ia/exercicesUi.js'].forEach((f) => {
    const s = lire(f);
    assert.ok(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest/.test(s.replace(/\/\*[\s\S]*?\*\//g, '')), f);
    assert.ok(!/[–—]/.test(s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'tiret long dans ' + f);
  });
});

test('branchement : scripts dans l\'ordre, état dans le chemin 1, clics, deux blocs dépliants aux deux niveaux, aucune couleur nouvelle', () => {
  const html = lire('index.html');
  const ordre = ['data/buiaDemande.js', 'data/buiaExercices.js', 'modules/bien-utiliser-ia/exercicesLogique.js', 'modules/bien-utiliser-ia/comprendreUi.js', 'modules/bien-utiliser-ia/exercicesUi.js', 'modules/bien-utiliser-ia/index.js'];
  ordre.forEach((s) => { assert.ok(html.includes('src="' + s + '"'), s); assert.ok(fs.existsSync(path.join(racine, s)), s); });
  for (let i = 1; i < ordre.length; i++) { assert.ok(html.indexOf(ordre[i - 1]) < html.indexOf(ordre[i]), ordre[i - 1] + ' avant ' + ordre[i]); }
  const index = lire('modules/bien-utiliser-ia/index.js');
  assert.match(index, /ex: buiaExVierge\(\)/); assert.match(index, /buiaExClic\(act, v\)/);
  const ui = lire('modules/bien-utiliser-ia/comprendreUi.js');
  assert.match(ui, /_buiaDepli\(BUIA_EX1\.titre, _buiaEx1Bloc\(\), '', false\)/);
  assert.match(ui, /_buiaDepli\(BUIA_EX2\.titre, _buiaEx2Bloc\(\), '', false\)/);
  assert.match(ui, /_buiaDepli\(BUIA_EX3\.titre, _buiaEx3Bloc\(\), '', false\)/);
  const css = lire('modules/bien-utiliser-ia/bienUtiliserIa.css');
  const partie = css.slice(css.indexOf('Exercices du chemin 1'));
  assert.ok(!/--buia-[a-z0-9-]+\s*:/.test(partie), 'aucune nouvelle variable de couleur dans le style des exercices');
  assert.ok(!/#[0-9a-fA-F]{3,6}\b/.test(partie.replace(/\/\*[\s\S]*?\*\//g, '')), 'aucune couleur écrite en dur (le mode sombre suivrait mal)');
});
