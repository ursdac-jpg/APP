'use strict';
// Appuis des textes écrits à la main du portrait et de l'Union européenne (consigne 143, option 3 de A13, seconde partie) :
// les phrases de ces documents donnent leurs chiffres dans la prose, l'adressage se fait par « début de la phrase#adresse ».
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const appuis = require('../outils/veilleAppuis.js');
const chiffres = require('../outils/veilleChiffres.js');

const RACINE = path.join(__dirname, '..');
const lire = (...p) => fs.readFileSync(path.join(RACINE, ...p), 'utf8');
const PORTRAIT = lire('modules', 'comprendre-les-chiffres', 'contenu', 'portrait-2026.md');
const UE = lire('modules', 'comprendre-les-chiffres', 'contenu', 'ue-2026.md');
const A_PORTRAIT = lire('outils', 'appuis', 'portrait-2026.appuis.txt');
const A_UE = lire('outils', 'appuis', 'ue-2026.appuis.txt');

const controler = (doc, ap) => appuis.controlerAppuis(doc, ap, 'annuel');
const alertesDe = (r, debut) => [].concat(...r.textes.filter((t) => t.cle.indexOf(debut) !== -1).map((t) => t.alertes));
const remplacer = (texte, avant, apres) => { assert.ok(texte.includes(avant), 'texte de départ introuvable : ' + avant); return texte.replace(avant, apres); };

test('appuis annuels : les fichiers réels du portrait et de l\'Europe concordent avec les documents, sans ligne mal formée', () => {
  [['portrait', PORTRAIT, A_PORTRAIT, 18, 60], ['ue', UE, A_UE, 5, 14]].forEach(([nom, doc, ap, textes, mini]) => {
    const r = controler(doc, ap);
    assert.ok(r.ok, r.erreur);
    assert.deepEqual(r.problemes, [], nom + ' : lignes mal formées : ' + r.problemes.join(' | '));
    const toutes = [].concat(...r.textes.map((t) => t.alertes.map((a) => t.cle + ' : ' + a.message)));
    assert.deepEqual(toutes, [], nom + ' : un texte écrit à la main dépend d\'un chiffre ou d\'un sens qui a changé. À relire avec Denis :\n' + toutes.join('\n'));
    assert.equal(r.textes.length, textes, nom + ' : nombre de textes déclarés');
    assert.ok(r.nbAppuis >= mini, nom + ' : appuis déclarés : ' + r.nbAppuis);
  });
});

test('appuis annuels : chaque texte déclaré désigne UNE phrase du document (c\'est ce qui permet le bouton « Modifier le texte »)', () => {
  [[PORTRAIT, A_PORTRAIT], [UE, A_UE]].forEach(([doc, ap]) => {
    const lu = chiffres.lireAnnuel(doc);
    const items = lu.puces.map((p) => ({ section: p.section, texte: p.avant })).concat(lu.paragraphes.map((p) => ({ section: p.section, texte: p.avant })));
    appuis.lireAppuis(ap).textes.forEach((t) => {
      const i = t.cle.indexOf(' | '), section = t.cle.slice(0, i), debut = t.cle.slice(i + 3);
      const n = items.filter((it) => it.section === section && it.texte.indexOf(debut) === 0).length;
      assert.equal(n, 1, 'le texte « ' + t.cle + ' » désigne ' + n + ' phrase(s) au lieu d\'une');
    });
  });
});

test('appuis annuels : la Dordogne qui passe au-dessus de la moyenne nationale (densité de médecins) donne une alerte FORTE', () => {
  const faux = remplacer(PORTRAIT, '**133 en Dordogne**', '**150 en Dordogne**');
  const a = alertesDe(controler(faux, A_PORTRAIT), 'Santé : la densité');
  assert.ok(a.some((x) => x.niveau === 'forte' && /Le sens change/.test(x.message) && /était en dessous de/.test(x.message) && /maintenant au-dessus de/.test(x.message)), JSON.stringify(a));
  assert.ok(a.some((x) => x.niveau === 'legere' && /133/.test(x.message) && /150/.test(x.message)), 'le chiffre qui bouge est aussi signalé');
  assert.ok(!/[–—]/.test(JSON.stringify(a)));
});

test('appuis annuels : un chiffre qui n\'est pas en gras (la moyenne nationale d\'âge) est suivi par son texte repère', () => {
  const faux = remplacer(PORTRAIT, 'moyenne française (environ 21 % de 65 ans', 'moyenne française (environ 28 % de 65 ans');
  const a = alertesDe(controler(faux, A_PORTRAIT), 'Part des 65 ans et plus');
  assert.ok(a.some((x) => x.niveau === 'forte' && /Le sens change/.test(x.message) && /Haute-Vienne|Part des 65 ans/.test(x.message)), JSON.stringify(a));
});

test('appuis annuels : un nombre à l\'intérieur d\'un passage en gras (naissances et décès) est adressé par « #2.2 »', () => {
  const faux = remplacer(PORTRAIT, '**2 850 naissances pour 4 570 décès**', '**2 850 naissances pour 2 100 décès**');
  const a = alertesDe(controler(faux, A_PORTRAIT), 'Naissances et décès');
  assert.ok(a.some((x) => x.niveau === 'forte' && /Le sens change/.test(x.message)), JSON.stringify(a));
});

test('appuis annuels : un chiffre signé qui change de signe (+0,2 % devient -0,2 %) donne une alerte FORTE', () => {
  const faux = remplacer(PORTRAIT, '**+0,2 % par an**', '**-0,2 % par an**');
  const a = alertesDe(controler(faux, A_PORTRAIT), 'Dordogne (24)');
  assert.ok(a.some((x) => x.niveau === 'forte' && /Le signe change/.test(x.message) && /positif/.test(x.message) && /négatif/.test(x.message)), JSON.stringify(a));
});

test('appuis annuels : une phrase réécrite dont le début a changé devient « introuvable » (alerte FORTE), jamais un silence', () => {
  const faux = remplacer(PORTRAIT, '- Santé : la densité de médecins', '- Médecins : la densité');
  const a = alertesDe(controler(faux, A_PORTRAIT), 'Santé : la densité');
  assert.ok(a.length > 0 && a.every((x) => x.niveau === 'forte' && /introuvable/.test(x.message)), JSON.stringify(a));
});

test('appuis annuels : Europe, le taux français qui passe sous la moyenne européenne donne une alerte FORTE sur la Lecture', () => {
  const faux = remplacer(UE, '- France : **8,5 %** (septembre 2026)', '- France : **5,9 %** (septembre 2026)');
  const a = alertesDe(controler(faux, A_UE), 'Le taux de chômage français');
  assert.ok(a.some((x) => x.niveau === 'forte' && /Le sens change/.test(x.message)), JSON.stringify(a));
  assert.ok(a.some((x) => x.niveau === 'legere' && /8,5/.test(x.message) && /5,9/.test(x.message)), JSON.stringify(a));
});

test('appuis annuels : « J\'ai relu » aligne la DÉCLARATION (chiffre et sens) du seul texte choisi, jamais le document', () => {
  const faux = remplacer(PORTRAIT, '**133 en Dordogne**', '**150 en Dordogne**');
  const cle = 'Les freins à l\'emploi sur le territoire | Santé : la densité';
  assert.ok(alertesDe(controler(faux, A_PORTRAIT), 'Santé : la densité').length > 0);
  const r = appuis.alignerAppuis(faux, A_PORTRAIT, cle, '2026-11-07', 'annuel');
  assert.ok(r.ok, r.erreur);
  assert.ok(r.modifies >= 3, 'modifications : ' + r.modifies);
  assert.deepEqual(alertesDe(controler(faux, r.texte), 'Santé : la densité'), []);
  assert.match(r.texte, /relu_le: 2026-11-07/);
  assert.equal(appuis.alignerAppuis(faux, r.texte, cle, '2026-11-07', 'annuel').texte, r.texte, 'idempotent');
});

test('appuis annuels : les pourcentages cités dans la Lecture de l\'Europe sont bien ceux des lignes de chiffres (garde du chiffre périmé)', () => {
  const lu = chiffres.lireAnnuel(UE);
  const gras = [].concat(...lu.puces.map((p) => chiffres.gras(p.avant))).join(' ');
  const lecture = lu.paragraphes.filter((p) => p.section === 'Lecture').map((p) => p.avant).join(' ');
  const cites = lecture.match(/\d+,\d+ %/g) || [];
  assert.ok(cites.length >= 4, 'pourcentages cités : ' + cites.length);
  cites.forEach((c) => assert.ok(gras.indexOf(c.replace(' %', '')) !== -1, 'La Lecture cite ' + c + ' qui n\'est plus dans les lignes de chiffres : texte à relire.'));
});

test('appuis annuels : aucun tiret long dans les fichiers d\'appuis', () => {
  assert.ok(!/[–—]/.test(A_PORTRAIT));
  assert.ok(!/[–—]/.test(A_UE));
});
