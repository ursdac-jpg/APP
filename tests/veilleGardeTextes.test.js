'use strict';
// Garde des textes écrits à la main de « Comprendre les chiffres » (consigne 134, option 1 de A13) : un paragraphe d'interprétation ne doit pas
// garder un ancien chiffre quand le relevé change. Le fichier réel doit passer ; des copies modifiées doivent être refusées, avec un message clair.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const garde = require('../outils/veilleGardeTextes.js');

const CONTENU = path.join(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu');
const lireFichier = (nom) => fs.readFileSync(path.join(CONTENU, nom), 'utf8');

// Tous les fichiers trimestriels (AAAA-MM.md) qui ont une « Lecture du territoire ».
const TRIMESTRIELS = fs.readdirSync(CONTENU).filter((f) => /^\d{4}-\d{2}\.md$/.test(f) && /\n## Lecture du territoire/.test(lireFichier(f).replace(/\r\n/g, '\n')));

test('garde des textes : au moins un fichier trimestriel est contrôlé, quatre territoires et plus de vingt chiffres (la garde ne tourne pas à vide)', () => {
  assert.ok(TRIMESTRIELS.length >= 1, 'aucun fichier trimestriel trouvé');
  const r = garde.controlerDigest(lireFichier(TRIMESTRIELS[TRIMESTRIELS.length - 1]));
  assert.equal(r.nbParagraphes, 4, 'quatre territoires contrôlés');
  assert.ok(r.nbNombres > 20, 'chiffres contrôlés : ' + r.nbNombres);
});

TRIMESTRIELS.forEach((f) => {
  test('garde des textes : ' + f + ', chaque chiffre des paragraphes « Lecture du territoire » est celui des données du même territoire', () => {
    const r = garde.controlerDigest(lireFichier(f));
    assert.deepEqual(r.problemes, [], 'Un paragraphe écrit à la main ne correspond plus aux chiffres relevés. À relire avec Denis :\n' + r.problemes.join('\n'));
  });
});

test('garde des textes : un chiffre changé dans le paragraphe est refusé, avec le territoire et le chiffre en clair', () => {
  const t = lireFichier(TRIMESTRIELS[TRIMESTRIELS.length - 1]);
  const faux = t.replace("Le chômage s'établit à 7,9 %", "Le chômage s'établit à 8,3 %");
  assert.notEqual(faux, t, 'le texte de départ contient bien la phrase attendue');
  const r = garde.controlerDigest(faux);
  assert.ok(r.problemes.some((p) => /Dordogne/.test(p) && /8,3/.test(p)), r.problemes.join(' | '));
});

test('garde des textes : le relevé qui change (7,9 devient 8,3) alors que le paragraphe garde 7,9 est refusé, même si 7,9 survit dans une série plus ancienne', () => {
  const t = lireFichier(TRIMESTRIELS[TRIMESTRIELS.length - 1]).replace(/\r\n/g, '\n');
  const lignes = t.split('\n');
  const i = lignes.findIndex((l) => /^- Dordogne \(24\) : \*\*7,9 %\*\*/.test(l));
  assert.ok(i > -1, 'puce de la Dordogne trouvée');
  lignes[i] = lignes[i].replace('**7,9 %**', '**8,3 %**');
  lignes[i + 1] = lignes[i + 1].replace('T2 2026: 7,9 %', 'T2 2026: 8,3 %').replace('T1 2026: 7,8 %', 'T1 2026: 7,9 %');
  const r = garde.controlerDigest(lignes.join('\n'));
  assert.ok(r.problemes.some((p) => /Dordogne/.test(p) && /taux de 7,9 %.*8,3 %/.test(p)), r.problemes.join(' | '));
});

test("garde des textes : un « un an plus tôt » qui n'est plus celui du relevé est refusé", () => {
  const t = lireFichier(TRIMESTRIELS[TRIMESTRIELS.length - 1]);
  const faux = t.replace('(7,1 % un an plus tôt)', '(6,5 % un an plus tôt)');
  assert.notEqual(faux, t);
  const r = garde.controlerDigest(faux);
  assert.ok(r.problemes.some((p) => /un an plus tôt/.test(p) && /7,1/.test(p)), r.problemes.join(' | '));
});

test('garde des textes : un paragraphe qui parle d\'un autre trimestre que la période du fichier est refusé', () => {
  const t = lireFichier(TRIMESTRIELS[TRIMESTRIELS.length - 1]);
  const faux = t.replace(/au deuxième trimestre 2026/g, 'au troisième trimestre 2026');
  assert.notEqual(faux, t);
  const r = garde.controlerDigest(faux);
  assert.ok(r.problemes.some((p) => /troisième trimestre 2026/.test(p) && /avril à juin 2026/.test(p)), r.problemes.join(' | '));
});

test("garde des textes : la part « inscrits depuis plus d'un an » citée doit être la valeur relevée, pas un point plus ancien de la série (cas réel du 07/11 : 46,0 au lieu de 46,5)", () => {
  const t = lireFichier(TRIMESTRIELS[TRIMESTRIELS.length - 1]);
  const faux = t.replace(/\(46,5 %,\s+en\s+hausse depuis un an\)/, '(46,0 %, en hausse depuis un an)');
  assert.notEqual(faux, t, 'le texte de départ contient bien la phrase attendue');
  const r = garde.controlerDigest(faux);
  assert.ok(r.problemes.some((p) => /France entière/.test(p) && /46,0/.test(p) && /46,5/.test(p)), r.problemes.join(' | '));
});

test('garde des textes : aucun tiret long dans les messages de la garde', () => {
  const r = garde.controlerDigest(lireFichier(TRIMESTRIELS[0]).replace("s'établit à 7,9 %", "s'établit à 1,2 %"));
  assert.ok(r.problemes.length > 0);
  assert.ok(!/[–—]/.test(r.problemes.join(' ')));
});
