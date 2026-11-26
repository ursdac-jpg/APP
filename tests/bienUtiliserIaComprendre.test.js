// Module « Bien utiliser l'IA », commit 3 : chemin 1 « Comprendre comment demander » (data/buiaComprendre.js, comprendreLogique.js, branchement).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaComprendre.js');
const E = require('../data/buiaDemande.js');
const L = require('../modules/bien-utiliser-ia/comprendreLogique.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const AUJOURDHUI = new Date(2026, 10, 23); // 23 novembre 2026

// Tous les textes lus par les personnes dans ce chemin.
function tousLesTextes() {
  const t = [D.BUIA_C1_ROUTE_TITRE, D.BUIA_C1_SOUS_TITRE];
  Object.values(D.BUIA_C1_NIVEAUX).forEach((x) => t.push(x));
  D.BUIA_C1_ETAPES.forEach((e) => t.push(e.label));
  const e1 = D.BUIA_C1_E1;
  t.push(e1.titre, e1.oui.titre, e1.non.titre, e1.schemaLibelle, e1.idee.titre, e1.idee.texte, e1.plus.titre, e1.rappel, ...e1.oui.items, ...e1.non.items, ...e1.plus.paragraphes);
  e1.schema.forEach((b) => t.push(b.titre, b.texte));
  const e2 = D.BUIA_C1_E2;
  t.push(e2.titre, ...e2.intro, e2.consigneSujet, e2.pauvre.tete, e2.pauvre.note, e2.riche.tete, e2.riche.note, e2.prudence);
  D.BUIA_C1_SUJETS.forEach((s) => { t.push(s.nom, s.avant, ...s.e, s.date.avant, s.date.milieu); });
  const e3 = D.BUIA_C1_E3;
  t.push(e3.titre, e3.intro, e3.assembleeTitre, e3.aideLibelle, e3.plus.titre, e3.techniques.titre);
  e3.plus.blocs.forEach((b) => t.push(b.titre, b.texte));
  e3.techniques.blocs.forEach((b) => t.push(b.titre, b.texte));
  E.BUIA_ELEMENTS.forEach((e) => { if (e.aide) { t.push(e.aide); } });
  [D.BUIA_C1_E4, D.BUIA_C1_E5, D.BUIA_C1_E7].forEach((e) => {
    t.push(e.titre, e.plus.titre, e.plus.texte);
    if (e.plus2) { t.push(e.plus2.titre, e.plus2.texte); }
    if (e.intro) { t.push(e.intro); }
    e.blocs.forEach((b) => t.push(b.titre, b.texte));
    if (e.reflexe) { t.push(e.reflexe.titre, e.reflexe.texte); }
    if (e.regle) { t.push(e.regle.titre, e.regle.texte); }
  });
  const e6 = D.BUIA_C1_E6;
  t.push(e6.titre, e6.intro, e6.boucleLibelle, ...e6.boucle, e6.boucleRetour, e6.reflexes.titre, e6.reflexes.texte, e6.consigneRisque, e6.plus.titre, e6.plus.texte, e6.plus2.titre, e6.plus2.texte, e6.plus3.titre, e6.plus3.texte);
  e6.risques.forEach((r) => t.push(r.nom, r.texte));
  const e8 = D.BUIA_C1_E8;
  t.push(e8.titre, e8.cleTitre, e8.cle, e8.phraseTitre, e8.phrase, e8.copierPhrase, e8.intro, e8.reconnaitreTitre, ...e8.reconnaitre, e8.exempleTitre, e8.exempleIntro, e8.avantTitre, ...e8.avant, e8.copier, e8.chargement, e8.indisponible, e8.copiee, e8.copieeLaPhrase);
  const f = D.BUIA_C1_FICHE;
  t.push(f.cleTitre, f.cle);
  t.push(f.titre, f.elementsTitre, ...f.rappels, f.methodeTitre, f.methode, f.avantTitre, ...f.avant, f.apresTitre, ...f.apres, f.boutons.modeles, f.boutons.ecrire, f.boutonFin);
  return t;
}

// ---------------- Structure ----------------
test('neuf étapes : huit écrans puis la fiche « Ce qu\'il faut retenir » ; « Ses questions d\'abord » juste avant la fiche', () => {
  assert.equal(L.buiaC1NombreEtapes(), 9);
  assert.deepEqual(L.buiaC1Etapes().map((e) => e.label), ['Ce qu’il sait', 'Une demande', 'Six éléments', 'La forme', 'Se protéger', 'Vérifier', 'Améliorer', 'Ses questions d’abord', 'À retenir']);
  L.buiaC1Etapes().forEach((e) => assert.match(e.icone, /^<i class="bi bi-[a-z0-9-]+"><\/i>$/));
});

test('étape : une valeur inconnue ou hors limites ramène dans la plage, jamais un écran vide', () => {
  assert.equal(L.buiaC1BorneEtape(3), 3);
  assert.equal(L.buiaC1BorneEtape(-5), 0);
  assert.equal(L.buiaC1BorneEtape(99), 8);
  assert.equal(L.buiaC1BorneEtape(2.9), 2);
  [undefined, null, NaN, '3', {}, Infinity].forEach((v) => assert.equal(L.buiaC1BorneEtape(v), 0, String(v)));
});

test('trois sujets de démonstration : ambassade, hôpital, voyage ; un identifiant inconnu donne le premier', () => {
  assert.deepEqual(L.buiaC1Sujets().map((s) => s.id), ['ambassade', 'hopital', 'voyage']);
  assert.equal(L.buiaC1Sujet('hopital').id, 'hopital');
  assert.equal(L.buiaC1Sujet('inconnu').id, 'ambassade');
  assert.equal(L.buiaC1Sujet(undefined).id, 'ambassade');
});

test('les six éléments viennent de la liste unique (data/buiaDemande.js) : mêmes noms, mêmes explications, jamais recopiés', () => {
  L.buiaC1Sujets().forEach((s) => {
    const el = L.buiaC1Elements(s.id, AUJOURDHUI);
    assert.equal(el.length, 6);
    el.forEach((e, i) => { assert.equal(e.nom, E.BUIA_ELEMENTS[i].nom); assert.equal(e.raison, E.BUIA_ELEMENTS[i].raison); assert.equal(e.n, i + 1); assert.ok(e.phrase.length > 15); });
  });
  const donnees = lire('data/buiaComprendre.js');
  E.BUIA_ELEMENTS.forEach((e) => { assert.ok(!donnees.includes(e.raison), 'explication recopiée : ' + e.id); });
});

test('chaque sujet contient les marques d\'une bonne demande : repères du texte, « pas une consigne », ne rien inventer, date du jour', () => {
  L.buiaC1Sujets().forEach((s) => {
    const el = L.buiaC1Elements(s.id, AUJOURDHUI);
    assert.match(el[2].phrase, /pas une consigne pour toi/);
    assert.match(el[2].phrase, /===== DÉBUT =====[\s\S]*===== FIN =====/);
    assert.match(el[4].phrase, /invente/i);
    assert.match(el[5].phrase, /^Aujourd’hui, nous sommes le 23 novembre 2026\./);
  });
});

// ---------------- Consigne 598 : questions d'aide et trois techniques ----------------
test('questions d’aide : « Pour qui ? Pourquoi ? » sous le but, « déjà fait / qui bloque » sous la situation, rien sous les autres éléments', () => {
  const el = L.buiaC1Elements('ambassade', AUJOURDHUI);
  assert.equal(el[0].aide, 'Pour qui ? Pourquoi ? Une phrase pour chacun suffit.');
  assert.equal(el[1].aide, 'Qu’est-ce qui est déjà fait ? Qu’est-ce qui bloque ?');
  el.slice(2).forEach((e) => assert.equal(e.aide, '', e.id));
  const donnees = lire('data/buiaComprendre.js');
  assert.ok(!donnees.includes(E.BUIA_ELEMENTS[0].aide) && !donnees.includes(E.BUIA_ELEMENTS[1].aide), 'questions d’aide recopiées hors de la liste unique');
});

test('écran 3, niveau « Pour aller plus loin » : trois techniques (découper, plus long n’est pas meilleur, citer le passage) ; ni rôle, ni « étape par étape » comme règle', () => {
  const b = D.BUIA_C1_E3.techniques.blocs;
  assert.deepEqual(b.map((x) => x.titre), ['Découper en étapes.', 'Plus long n’est pas meilleur.', 'Demander la citation du passage.']);
  const tout = JSON.stringify(D.BUIA_C1_E3.techniques).toLowerCase();
  assert.ok(!/tu es un|rôle|réfléchis/.test(tout), 'rôle réaliste et raisonnement pas à pas non retenus');
  assert.match(b[2].texte, /cite le passage du document/);
  assert.match(b[2].texte, /Retrouvez ensuite le passage/);
});

test('écran 3 : les questions d’aide s’affichent dans la ligne ouverte du but et de la situation, et les trois techniques seulement au niveau « Pour aller plus loin »', () => {
  const ui = lire('modules/bien-utiliser-ia/comprendreUi.js');
  assert.match(ui, /e\.aide \? '<div class="buia-aide-q">/);
  assert.match(ui, /\[t\.plus, t\.techniques\]\.forEach/);
  assert.match(ui, /if \(_buiaPlus\(\)\) \{\s*\[t\.plus, t\.techniques\]/);
});

// ---------------- Dates ----------------
test('date en français : jour, mois, année, jour de la semaine, « 1er »', () => {
  assert.equal(L.buiaDateFrancaise(new Date(2026, 10, 23), { annee: true }), '23 novembre 2026');
  assert.equal(L.buiaDateFrancaise(new Date(2026, 11, 3), { jourSemaine: true }), 'jeudi 3 décembre');
  assert.equal(L.buiaDateFrancaise(new Date(2027, 0, 1)), '1er janvier');
  assert.equal(L.buiaDateFrancaise(new Date(2026, 7, 5)), '5 août');
});

test('date invalide ou absente : une chaîne vide, jamais « NaN » ni « undefined »', () => {
  [undefined, null, new Date('x'), '2026-11-23', 5, {}].forEach((v) => assert.equal(L.buiaDateFrancaise(v), '', String(v)));
});

test('le délai se calcule à partir de la date du jour : mêmes écarts que la maquette (ambassade 15 janvier, hôpital jeudi 3 décembre, voyage samedi 12 décembre)', () => {
  assert.match(L.buiaC1PhraseDate('ambassade', AUJOURDHUI), /Mon voyage est prévu le 15 janvier\.$/);
  assert.match(L.buiaC1PhraseDate('hopital', AUJOURDHUI), /Mon rendez-vous a lieu le jeudi 3 décembre\.$/);
  assert.match(L.buiaC1PhraseDate('voyage', AUJOURDHUI), /Je pars le samedi 12 décembre\.$/);
});

test('la date suit le calendrier réel : un autre jour donne un autre délai et le bon jour de la semaine ; passage à l\'heure d\'hiver sans décalage', () => {
  const autre = new Date(2027, 2, 1); // 1er mars 2027
  assert.match(L.buiaC1PhraseDate('hopital', autre), /nous sommes le 1er mars 2027\. Mon rendez-vous a lieu le (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) 11 mars\.$/);
  assert.equal(L.buiaDateFrancaise(L.buiaAjouterJours(new Date(2026, 9, 24), 2)), '26 octobre'); // 25 octobre 2026 = heure d'hiver
  assert.equal(L.buiaDateFrancaise(L.buiaAjouterJours(new Date(2026, 11, 30), 3)), '2 janvier');
  // sans date fournie, la date du jour réelle est utilisée : jamais de texte cassé
  assert.match(L.buiaC1PhraseDate('voyage'), /^Aujourd’hui, nous sommes le \d{1,2}(er)? [a-zéû]+ \d{4}\. Je pars le [a-z]+ \d{1,2}(er)? [a-zéû]+\.$/);
  assert.ok(!/NaN|undefined/.test(L.buiaC1PhraseDate('voyage', new Date('x'))));
});

// ---------------- Demande assemblée ----------------
test('la demande assemblée suit l\'ordre décidé : but, date, situation, texte, attente, interdits', () => {
  const a = L.buiaC1Assemblee('ambassade', AUJOURDHUI);
  assert.deepEqual(a.map((x) => x.n), [1, 6, 2, 3, 4, 5]);
  assert.equal(a.length, 6);
  assert.match(a[0].texte, /^Aide-moi à écrire une lettre à l’ambassade/);
  assert.match(a[1].texte, /Aujourd’hui, nous sommes le/);
});

test('demande courte / demande complète : la complète réunit but, situation et attente, la courte reste courte', () => {
  L.buiaC1Sujets().forEach((s) => {
    const aa = L.buiaC1AvantApres(s.id, AUJOURDHUI), el = L.buiaC1Elements(s.id, AUJOURDHUI);
    assert.equal(aa.apres, el[0].phrase + ' ' + el[1].phrase + ' ' + el[3].phrase);
    assert.ok(aa.avant.length < aa.apres.length / 2);
    assert.ok(aa.avant.length < 60);
  });
});

// ---------------- Vérifier la réponse ----------------
test('six sujets à vérifier ; un identifiant inconnu donne le premier ; santé et urgence : 15 ou 112', () => {
  assert.deepEqual(L.buiaC1Risques().map((r) => r.id), ['courrier', 'sante', 'argent', 'droit', 'etudes', 'quotidien']);
  assert.equal(L.buiaC1Risque('xx').id, 'courrier');
  assert.match(L.buiaC1Risque('sante').texte, /15 ou le 112/);
  assert.match(L.buiaC1Risque('droit').texte, /permanence d’accès aux droits/);
});

test('fiche : six lignes numérotées, dans l\'ordre, avec le nom de chaque élément', () => {
  const l = L.buiaC1LignesFiche();
  assert.equal(l.length, 6);
  l.forEach((x, i) => { assert.ok(x.texte.startsWith((i + 1) + '. ' + E.BUIA_ELEMENTS[i].nom + ' : '), x.texte); });
  assert.equal(D.BUIA_C1_FICHE.rappels.length, 6);
});

// ---------------- Règles de texte ----------------
test('règles de rédaction : pas de tiret long, pas de « on », pas de « facultatif », pas de mot IA, pas de robot, pas de nom d\'outil, apostrophes typographiques', () => {
  tousLesTextes().forEach((t) => {
    assert.equal(typeof t, 'string');
    assert.ok(t.length > 0);
    assert.ok(!/[–—]/.test(t), 'tiret long : ' + t);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(t), 'mot « on » : ' + t);
    assert.ok(!/facultatif/i.test(t), 'facultatif : ' + t);
    assert.ok(!/\bIA\b/.test(t), 'IA : ' + t);
    assert.ok(!/robot/i.test(t), 'robot : ' + t);
    assert.ok(!/ChatGPT|Mistral|Gemini|Copilot|Perplexity|Claude/.test(t), 'nom d\'outil : ' + t);
    assert.ok(!/'/.test(t), 'apostrophe droite : ' + t);
    assert.ok(!/[-]{2}|\.\.\./.test(t.replace(/=====/g, '')), 'tirets doubles ou points de suspension : ' + t);
  });
});

test('le mot « prompt » apparaît une seule fois dans tout le chemin : la phrase qui l\'explique (écran 2)', () => {
  const trouves = tousLesTextes().filter((t) => /prompt/i.test(t));
  assert.equal(trouves.length, 1);
  assert.match(trouves[0], /Le mot anglais « prompt » veut dire : la demande que vous écrivez\./);
});

test('aucune note, aucun diagnostic, aucune promesse : ni « bravo », ni « félicitations », ni « score »', () => {
  tousLesTextes().forEach((t) => { assert.ok(!/bravo|félicitations|score|niveau insuffisant|diagnostic/i.test(t), t); });
});

test('la vidéo du chemin vient du composant partagé : plus d\'emplacement propre, un appel au composant', () => {
  assert.equal(D.BUIA_C1_VIDEO, undefined);
  assert.equal(D.BUIA_C1_VIDEO_ABSENTE, undefined);
  assert.ok(!lire('modules/bien-utiliser-ia/comprendreUi.js').includes('_buiaVideoChemin('), 'le film est sur la tuile du chemin, plus sur son premier écran');
});

// ---------------- Branchement ----------------
test('branchement : scripts dans l\'ordre, route, aide contextuelle, feuille de style avec les six couleurs et leur valeur en mode sombre', () => {
  const html = lire('index.html');
  const ordre = ['data/buiaDemande.js', 'data/buiaComprendre.js', 'modules/bien-utiliser-ia/logique.js', 'modules/bien-utiliser-ia/blocs.js',
    'modules/bien-utiliser-ia/comprendreLogique.js', 'modules/bien-utiliser-ia/comprendreUi.js', 'modules/bien-utiliser-ia/index.js'];
  ordre.forEach((s) => { assert.ok(html.includes('src="' + s + '"'), s); assert.ok(fs.existsSync(path.join(racine, s)), s); });
  for (let i = 1; i < ordre.length; i++) { assert.ok(html.indexOf(ordre[i - 1]) < html.indexOf(ordre[i]), ordre[i - 1] + ' avant ' + ordre[i]); }
  const app = lire('js/app.js');
  assert.ok(app.includes("'bien-utiliser-ia-comprendre': typeof pageBienUtiliserIaComprendre"));
  assert.ok(app.includes("AIDE_PAGES['bien-utiliser-ia-comprendre']"));
  const index = lire('modules/bien-utiliser-ia/index.js');
  assert.ok(index.includes("BUIA_ROUTE_COMPRENDRE = 'bien-utiliser-ia-comprendre'"));
  const css = lire('modules/bien-utiliser-ia/bienUtiliserIa.css');
  const [clair, sombre] = css.split('[data-theme="sombre"]');
  for (let n = 1; n <= 6; n++) {
    assert.ok(new RegExp('--buia-c' + n + ':').test(clair), 'couleur claire ' + n);
    assert.ok(new RegExp('--buia-c' + n + 't:').test(sombre), 'couleur sombre texte ' + n);
    assert.ok(new RegExp('--buia-c' + n + ':').test(sombre), 'couleur sombre fond ' + n);
  }
});

test('feuille de style : aucune couleur écrite en dur hors des six couleurs des éléments (le thème et le mode sombre suivent)', () => {
  const css = lire('modules/bien-utiliser-ia/bienUtiliserIa.css');
  const hors = css.split('\n').filter((l) => /#[0-9a-fA-F]{3,6}\b/.test(l) && !/--buia-c[1-6]t?:/.test(l) && !/var\(--[a-z-]+,\s*#fff\)|color: #fff|background: var\(--accent\); color: #fff/.test(l));
  assert.deepEqual(hors, []);
});

test('l\'écran d\'entrée ouvre le chemin 1 pour de vrai ; les chemins 2 et 3 affichent encore le message honnête', () => {
  const index = lire('modules/bien-utiliser-ia/index.js');
  assert.match(index, /act === 'chemin' && v === 'comprendre'[\s\S]*naviguerVers\(BUIA_ROUTE_COMPRENDRE\)/);
  assert.match(index, /_buiaUi\.enConstruction = v/);
  const ui = lire('modules/bien-utiliser-ia/comprendreUi.js');
  assert.ok(!/[–—]/.test(ui.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'tiret long dans comprendreUi.js');
  assert.ok(!/localStorage|sessionStorage/.test(ui), 'rien n\'est enregistré sur l\'appareil');
});

test('au-delà du prompt : conversation longue (écran 7) et comparer deux réponses (écran 6), niveau « Pour aller plus loin »', () => {
  const e7 = D.BUIA_C1_E7.plus2, e6 = D.BUIA_C1_E6.plus2;
  assert.match(e7.titre, /conversation longue/); assert.match(e7.texte, /nouvelle conversation/); assert.match(e7.texte, /résumé/);
  assert.match(e6.titre, /deux fois/); assert.match(e6.texte, /source officielle/); assert.match(e6.texte, /pas une preuve/);
  assert.doesNotMatch(e6.texte + e7.texte, /on/i);
});

test('P9 : l’assistant a tendance à donner raison, présenté comme des pistes et non des garanties, sans chiffre ni nom d’outil, affiché au niveau « Pour aller plus loin » seulement', () => {
  const g = D.BUIA_C1_E6.plus3;
  assert.match(g.titre, /donner raison/); assert.match(g.texte, /pas une preuve/); assert.match(g.texte, /arguments contraires|points faibles/);
  assert.match(g.texte, /pistes, pas des garanties/); assert.match(g.texte, /personne de confiance/);
  assert.ok(!/\d/.test(g.titre + g.texte), 'aucun chiffre : l’étude donne des pourcentages différents selon la version');
  assert.ok(!/ChatGPT|Copilot|Gemini|Claude|Perplexity|DeepSeek|Mistral|Le Chat/.test(g.titre + g.texte), 'aucun nom d’outil');
  const ui = lire('modules/bien-utiliser-ia/comprendreUi.js');
  assert.match(ui, /if \(_buiaPlus\(\)\) \{ \[t\.plus, t\.plus2, t\.plus3\]/);
});

// ---------------- Écran 8 « Ses questions d'abord » (consignes 609, 612 à 614) ----------------
test('écran 8 : l\'exemple est lu dans son fichier, avec le français corrigé et le fond gardé', () => {
  const t = L.buiaC1TexteExemple(lire(D.BUIA_C1_FICHIER_EXEMPLE));
  assert.ok(t.length > 2000, 'exemple trop court ou absent');
  assert.match(t, /^Vous êtes mon stratège en développement personnel : à la fois coach de dirigeants/);
  assert.match(t, /PHASE 1 : ENTRETIEN APPROFONDI/);
  assert.match(t, /PHASE 5 : MES OUTILS DE SUIVI/);
  assert.match(t, /Soyez direct\. Ne me flattez pas\./);
  assert.match(t, /noter chaque domaine de 1 à 10/);
  assert.match(t, /Commencez la phase 1 maintenant, avec vos premières questions\.$/);
  assert.equal((t.match(/^\d+\. /gm) || []).length, 10, 'dix domaines numérotés, pas onze');
  assert.ok(!/[–—]|\\-|"|SYSTÈME D’EXPLOITATION|Sprint|auto-assistance|ENTRÉE PROFONDE|Modèles ou contradictions|\bvs\./.test(t), 'tournure non corrigée');
  assert.ok(!/Statut|Comment le modifier/.test(t), 'le commentaire du fichier ne doit jamais être affiché');
});

test('écran 8 : un fichier sans bloc « exemple », vide ou abîmé ne donne jamais de texte', () => {
  assert.equal(L.buiaC1TexteExemple(''), '');
  assert.equal(L.buiaC1TexteExemple('# titre\n## autre\ntexte'), '');
  assert.equal(L.buiaC1TexteExemple('## exemple\n   '), '');
  assert.equal(L.buiaC1TexteExemple('## exemple\nun texte — abîmé'), '');
  assert.equal(L.buiaC1TexteExemple('## exemple\nun {{repere}}'), '');
  assert.equal(L.buiaC1TexteExemple('## exemple\nBonjour.'), 'Bonjour.');
});

test('écran 8 et fiche : le conseil clé et la phrase à copier', () => {
  assert.match(D.BUIA_C1_E8.cle, /poser d’abord ses questions/);
  assert.match(D.BUIA_C1_E8.phrase, /pose-moi tes questions.*attends mes réponses\.$/);
  assert.match(D.BUIA_C1_FICHE.cle, /pose-moi tes questions d’abord/);
  assert.equal(D.BUIA_C1_E8.avant.length, 4);
});
