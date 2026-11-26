// Module « Bien utiliser l'IA », commit 2 : liste unique des six éléments, réglages (data/buiaDemande.js), lecteur du fichier de phrases
// (modules/bien-utiliser-ia/blocs.js) et fichier prompts/bien-utiliser-blocs.md lui-même.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaDemande.js');
const B = require('../modules/bien-utiliser-ia/blocs.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const fichier = lire(B.BUIA_FICHIER_BLOCS);
const lecture = B.buiaLireBlocs(fichier);

// ---------------- Les six éléments ----------------
test('exactement six éléments, numérotés de 1 à 6, dans l\'ordre décidé', () => {
  assert.equal(D.BUIA_ELEMENTS.length, 6);
  assert.deepEqual(D.BUIA_ELEMENTS.map((e) => e.n), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(D.BUIA_ELEMENTS.map((e) => e.nom), ['Le but', 'La situation', 'Le texte à traiter', 'Ce que j’attends', 'Ce qu’il ne doit pas faire', 'La date et le délai']);
  assert.equal(new Set(D.BUIA_ELEMENTS.map((e) => e.id)).size, 6);
  D.BUIA_ELEMENTS.forEach((e) => { assert.ok(e.raison.length > 40, e.id); });
});

test('textes affichés aux personnes : pas de tiret long, pas de « on », pas de « prompt », pas de mot IA, apostrophes typographiques', () => {
  const t = [];
  D.BUIA_ELEMENTS.forEach((e) => { t.push(e.nom, e.raison); if (e.aide) { t.push(e.aide); } });
  D.BUIA_REGLAGES.forEach((g) => { t.push(g.titre); g.choix.forEach((c) => t.push(c.lib)); });
  D.BUIA_INTERRUPTEURS.forEach((i) => t.push(i.lib));
  t.forEach((x) => {
    assert.ok(!/[–—]/.test(x), 'tiret long : ' + x);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(x), '« on » : ' + x);
    assert.ok(!/prompt/i.test(x), 'prompt : ' + x);
    assert.ok(!/\bIA\b/.test(x), 'IA : ' + x);
    assert.ok(!/'/.test(x), 'apostrophe droite : ' + x);
  });
});

test('les réglages ne peuvent viser que les éléments 4 et 5 ; chaque valeur par défaut existe parmi les choix', () => {
  D.BUIA_REGLAGES.forEach((g) => {
    assert.ok([4, 5].includes(g.element), g.groupe);
    assert.ok(g.choix.some((c) => c.v === g.defaut), 'défaut de ' + g.groupe);
  });
  D.BUIA_INTERRUPTEURS.forEach((i) => assert.ok([4, 5].includes(i.element), i.id));
  assert.deepEqual(D.BUIA_REGLAGES.map((g) => g.groupe), ['longueur', 'langage']);
  assert.deepEqual(D.BUIA_INTERRUPTEURS.map((i) => i.id), ['inventer', 'juridique', 'suppose', 'questions']);
});

// ---------------- Le lecteur ----------------
test('lecteur : un bloc par « ## », l\'entête et les commentaires ne sont jamais envoyés', () => {
  const l = B.buiaLireBlocs('Entête ignorée\n\n## a\nUn.\n<!-- commentaire -->\nDeux.\n\n\n\nTrois.\n\n## b\nSeul.\n');
  assert.deepEqual(Object.keys(l.blocs), ['a', 'b']);
  assert.equal(l.blocs.a, 'Un.\nDeux.\n\nTrois.');
  assert.equal(l.blocs.b, 'Seul.');
  assert.deepEqual(l.doublons, []);
});

test('lecteur : fins de ligne Windows, marque d\'ordre des octets, espaces en fin de ligne', () => {
  const l = B.buiaLireBlocs('﻿# Titre\r\n\r\n## a  \r\nTexte.   \r\nSuite.\r\n## b\r\nAutre.\r\n');
  assert.equal(l.blocs.a, 'Texte.\nSuite.');
  assert.equal(l.blocs.b, 'Autre.');
});

test('lecteur : un nom écrit deux fois garde le premier texte et est signalé ; un titre « ### » n\'ouvre pas un bloc', () => {
  const l = B.buiaLireBlocs('## a\nUn.\n## a\nDeux.\n### sous-titre\nReste dans a.\n');
  assert.equal(l.blocs.a, 'Un.');
  assert.deepEqual(l.doublons, ['a']);
  const m = B.buiaLireBlocs('## a\nUn.\n### sous-titre\nSuite.\n');
  assert.equal(m.blocs.a, 'Un.\n### sous-titre\nSuite.');
});

test('lecteur : une entrée vide ou absente ne casse rien', () => {
  [undefined, null, '', '   \n  ', 'sans titre de bloc'].forEach((v) => { assert.deepEqual(B.buiaLireBlocs(v), { blocs: {}, doublons: [] }); });
});

// ---------------- Vérification ----------------
test('vérification : bloc absent, vide, en double, tiret long, crochet : chaque défaut est nommé', () => {
  const ok = B.buiaLireBlocs(fichier);
  assert.deepEqual(B.buiaVerifierBlocs(ok), []);
  const sans = JSON.parse(JSON.stringify(ok)); delete sans.blocs['langage-simple']; sans.blocs['longueur-court'] = '   ';
  const p = B.buiaVerifierBlocs(sans);
  assert.ok(p.includes('Bloc absent ou vide : langage-simple') && p.includes('Bloc absent ou vide : longueur-court'));
  const mauvais = JSON.parse(JSON.stringify(ok)); mauvais.blocs['langage-soigne'] = 'Écris – bien [à compléter].'; mauvais.doublons = ['socle-final'];
  const q = B.buiaVerifierBlocs(mauvais);
  assert.ok(q.some((x) => /Tiret long.*langage-soigne/.test(x)));
  assert.ok(q.some((x) => /Crochet ou accolade.*langage-soigne/.test(x)));
  assert.ok(q.includes('Bloc écrit deux fois : socle-final'));
  assert.ok(B.buiaVerifierBlocs(null).length > 0, 'rien de lu = problèmes');
});

test('blocs attendus : un nom par choix de réglage, par interrupteur, et la phrase finale ; aucun nom en double', () => {
  const noms = B.buiaNomsBlocsAttendus();
  assert.equal(new Set(noms).size, noms.length);
  // 3 longueurs, 2 langages, 4 interrupteurs, la phrase finale, puis les 8 blocs du chemin « Écrire ma propre demande » (4 champs, 4 corrections : « interdit-inventer » et « interdit-suppose » sont déjà comptés)
  assert.equal(noms.length, 3 + 2 + 4 + 1 + 8);
  assert.equal(noms[9], 'socle-final');
});

// ---------------- Le fichier prompts/bien-utiliser-blocs.md ----------------
test('le fichier de phrases : tous les blocs attendus sont présents, non vides, sans défaut', () => {
  assert.deepEqual(B.buiaBlocsManquants(lecture.blocs), []);
  assert.deepEqual(B.buiaVerifierBlocs(lecture), []);
  // aucun bloc inattendu : un nom mal écrit par une correction serait sinon sans effet
  const attendus = new Set(B.buiaNomsBlocsAttendus());
  Object.keys(lecture.blocs).forEach((n) => assert.ok(attendus.has(n), 'bloc inattendu : ' + n));
});

test('le fichier de phrases : règles de rédaction (pas de tiret long, pas de « on », pas de double ligne vide, apostrophes typographiques, une phrase finie par un point)', () => {
  assert.ok(!/[–—]/.test(fichier), 'tiret long dans le fichier');
  Object.keys(lecture.blocs).forEach((n) => {
    const t = lecture.blocs[n];
    assert.ok(!/\n\n\n/.test(t), 'double ligne vide : ' + n);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(t), '« on » : ' + n);
    assert.ok(!/'/.test(t), 'apostrophe droite : ' + n);
    if (!/=====/.test(t)) { assert.ok(/[.?!]$/.test(t), 'une phrase doit se terminer : ' + n); }   // un texte encadré par des repères (===== DÉBUT ... FIN =====) se termine par son repère
    assert.ok(!/prompt|robot/i.test(t), 'mot réservé : ' + n);
  });
});

test('le fichier de phrases : écrit en UTF-8, les accents sont intacts', () => {
  assert.ok(fichier.includes('Réponds') && fichier.includes('N’invente rien'));
  assert.ok(!fichier.includes('�'), 'caractère de remplacement : fichier abîmé');
});

// ---------------- Assemblage des réglages ----------------
test('réglages par défaut : moyen, simple, ne rien inventer activé, le reste fermé', () => {
  assert.deepEqual(B.buiaReglagesParDefaut(), { longueur: 'moyen', langage: 'simple', interrupteurs: { inventer: true, juridique: false, suppose: false, questions: false } });
});

test('assemblage : un seul bloc par groupe à choix, rangé sous le bon élément, dans un ordre fixe', () => {
  const r = B.buiaTexteReglages(lecture.blocs, { longueur: 'court', langage: 'soigne', interrupteurs: { juridique: true } });
  assert.deepEqual(r.map((x) => x.element), [4, 4, 5, 5]);
  assert.equal(r[0].texte, lecture.blocs['longueur-court']);
  assert.equal(r[1].texte, lecture.blocs['langage-soigne']);
  assert.equal(r[2].texte, lecture.blocs['interdit-inventer']);
  assert.equal(r[3].texte, lecture.blocs['interdit-juridique']);
  // jamais deux phrases du même groupe à choix
  assert.equal(r.filter((x) => /^Réponds/.test(x.texte)).length, 1);
});

test('assemblage : une valeur inconnue ou absente donne la valeur par défaut, jamais un trou ni deux blocs', () => {
  [undefined, null, {}, { longueur: 'enorme' }, { longueur: ['court', 'detaille'] }, { langage: 42 }].forEach((c) => {
    const r = B.buiaTexteReglages(lecture.blocs, c);
    assert.equal(r[0].texte, lecture.blocs['longueur-moyen']);
    assert.equal(r[1].texte, lecture.blocs['langage-simple']);
    assert.equal(r.filter((x) => x.element === 4).length, 2);
  });
  assert.equal(B.buiaChoixValide('longueur', 'court'), 'court');
  assert.equal(B.buiaChoixValide('longueur', 'x'), 'moyen');
  assert.equal(B.buiaChoixValide('inconnu', 'x'), null);
});

test('assemblage : « me poser d\'abord trois questions » n\'existe qu\'au niveau « Pour aller plus loin »', () => {
  const choix = { interrupteurs: { questions: true } };
  assert.ok(!B.buiaTexteReglages(lecture.blocs, choix).some((x) => x.texte === lecture.blocs['questions-oui']));
  assert.ok(!B.buiaTexteReglages(lecture.blocs, choix, 'base').some((x) => x.texte === lecture.blocs['questions-oui']));
  assert.ok(B.buiaTexteReglages(lecture.blocs, choix, 'plus').some((x) => x.texte === lecture.blocs['questions-oui']));
});

test('assemblage : un interrupteur mal formé est ignoré ; ne rien inventer se désactive vraiment', () => {
  const r = B.buiaTexteReglages(lecture.blocs, { interrupteurs: { inventer: false, suppose: 'oui', inconnu: true } });
  assert.deepEqual(r.map((x) => x.element), [4, 4]);
  const n = B.buiaNettoyerReglages({ interrupteurs: { suppose: 'oui', inventer: false } });
  assert.equal(n.interrupteurs.inventer, false);
  assert.equal(n.interrupteurs.suppose, false);
  assert.ok(!('inconnu' in n.interrupteurs));
});

test('assemblage : blocs absents = rien d\'inventé (aucun texte de secours dans le code)', () => {
  assert.deepEqual(B.buiaTexteReglages({}, null), []);
  assert.deepEqual(B.buiaTexteReglages(null, null), []);
  assert.equal(B.buiaTexteFinal({}), '');
  assert.equal(B.buiaTexteFinal(lecture.blocs), lecture.blocs['socle-final']);
});

test('le bouton « Copier » reste fermé tant qu\'un champ ou un repère reste à compléter', () => {
  ['Voici [à compléter : le courrier]', 'Voici [ À compléter ]', 'Bonjour {{nom}}', 'fin }}'].forEach((t) => assert.equal(B.buiaResteACompleter(t), true, t));
  ['Voici mon courrier complet.', '', null, undefined, 'Le texte cite [1] une source.'].forEach((t) => assert.equal(B.buiaResteACompleter(t), false, String(t)));
});

// ---------------- Branchement ----------------
test('branchement : les scripts existent, dans l\'ordre (données, logique, lecteur, page) ; le chargeur lit bien le fichier, sans copie intégrée', () => {
  const html = lire('index.html');
  const ordre = ['data/buiaEntree.js', 'data/buiaDemande.js', 'modules/bien-utiliser-ia/logique.js', 'modules/bien-utiliser-ia/blocs.js', 'modules/bien-utiliser-ia/index.js'];
  ordre.forEach((s) => { assert.ok(html.includes('src="' + s + '"'), s); assert.ok(fs.existsSync(path.join(racine, s)), s); });
  for (let i = 1; i < ordre.length; i++) { assert.ok(html.indexOf(ordre[i - 1]) < html.indexOf(ordre[i]), ordre[i - 1] + ' avant ' + ordre[i]); }
  const index = lire('modules/bien-utiliser-ia/index.js');
  assert.ok(index.includes('fetch(BUIA_FICHIER_BLOCS'), 'le chargeur lit le fichier');
  assert.ok(index.includes('BUIA_MESSAGE_BLOCS_INDISPONIBLES'), 'message calme si le fichier manque');
  // aucune phrase du fichier recopiée dans le code
  const code = lire('modules/bien-utiliser-ia/blocs.js') + index + lire('data/buiaDemande.js');
  ['Réponds en une à trois phrases', 'N’invente rien', 'en français impeccable'].forEach((p) => assert.ok(!code.includes(p), 'phrase recopiée dans le code : ' + p));
});
