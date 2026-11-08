'use strict';
// Appuis des textes écrits à la main (consigne 143, option 3 de A13) : la déclaration réelle doit concorder avec les chiffres réels ;
// des copies modifiées doivent produire l'alerte du bon niveau ; « J'ai relu » ne touche que la déclaration.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const appuis = require('../outils/veilleAppuis.js');

const RACINE = path.join(__dirname, '..');
const NOM = '2026-06';
const DIGEST = fs.readFileSync(path.join(RACINE, 'modules', 'comprendre-les-chiffres', 'contenu', NOM + '.md'), 'utf8');
const APPUIS = fs.readFileSync(path.join(RACINE, 'outils', 'appuis', NOM + '.appuis.txt'), 'utf8');

const alertesDe = (r, cle) => (r.textes.filter((t) => t.cle === cle)[0] || { alertes: [] }).alertes;

test('appuis : le fichier réel concorde avec les chiffres réels, aucune ligne mal formée, et la liste ne tourne pas à vide', () => {
  const r = appuis.controlerAppuis(DIGEST, APPUIS);
  assert.ok(r.ok, r.erreur);
  assert.deepEqual(r.problemes, [], 'lignes mal formées : ' + r.problemes.join(' | '));
  const toutes = [].concat(...r.textes.map((t) => t.alertes.map((a) => t.cle + ' : ' + a.message)));
  assert.deepEqual(toutes, [], 'Un texte écrit à la main dépend d\'un chiffre ou d\'un sens qui a changé. À relire avec Denis :\n' + toutes.join('\n'));
  assert.equal(r.textes.length, 8, 'quatre synthèses et quatre lectures');
  assert.ok(r.nbAppuis >= 30, 'appuis déclarés : ' + r.nbAppuis);
});

test('appuis : un sens qui s\'inverse (la Dordogne passe au-dessus de la France) donne une alerte FORTE, avec les deux chiffres', () => {
  const faux = DIGEST.replace(/(- Dordogne \(24\) : \*\*)7,9 %(\*\* \(2e trimestre 2026)/, '$18,9 %$2');
  assert.notEqual(faux, DIGEST);
  const a = alertesDe(appuis.controlerAppuis(faux, APPUIS), 'Synthèse courte | Dordogne (24)');
  const forte = a.filter((x) => x.niveau === 'forte');
  assert.ok(forte.some((x) => /Le sens change/.test(x.message) && /8,9/.test(x.message) && /était en dessous de/.test(x.message) && /maintenant au-dessus de/.test(x.message)), JSON.stringify(a));
});

test('appuis : un chiffre qui bouge sans changer le sens donne une alerte LÉGÈRE seulement', () => {
  const faux = DIGEST.replace(/(- Dordogne \(24\) : \*\*)7,9 %(\*\* \(2e trimestre 2026)/, '$17,8 %$2');
  assert.notEqual(faux, DIGEST);
  const a = alertesDe(appuis.controlerAppuis(faux, APPUIS), 'Lecture du territoire | Dordogne');
  assert.ok(a.length > 0 && a.every((x) => x.niveau === 'legere'), JSON.stringify(a));
  assert.ok(a.some((x) => /7,9 %/.test(x.message) && /7,8 %/.test(x.message)), JSON.stringify(a));
});

test('appuis : une hausse sur un an qui devient une baisse donne une alerte FORTE', () => {
  const faux = DIGEST.replace('serie: T2 2025: 7,1 % ; T3 2025: 7,4 %', 'serie: T2 2025: 8,5 % ; T3 2025: 7,4 %');
  assert.notEqual(faux, DIGEST);
  const a = alertesDe(appuis.controlerAppuis(faux, APPUIS), 'Synthèse courte | Dordogne (24)');
  assert.ok(a.some((x) => x.niveau === 'forte' && /était en hausse/.test(x.message) && /maintenant en baisse/.test(x.message)), JSON.stringify(a));
});

test('appuis : un appui dont l\'entrée a disparu du fichier de chiffres donne une alerte FORTE (impossible à vérifier)', () => {
  const faux = APPUIS.replace('| Dordogne (24) | moins que |', '| Dordogne (25) | moins que |');
  assert.notEqual(faux, APPUIS);
  const a = alertesDe(appuis.controlerAppuis(DIGEST, faux), 'Synthèse courte | Dordogne (24)');
  assert.ok(a.some((x) => x.niveau === 'forte' && /introuvable/.test(x.message)), JSON.stringify(a));
});

test('appuis : une ligne mal formée est signalée avec son numéro, sans planter', () => {
  const r = appuis.controlerAppuis(DIGEST, APPUIS + '\ntexte: Essai\n  valeur: a | b\n  n importe quoi\n');
  assert.ok(r.problemes.some((p) => /demande 4 éléments/.test(p)), r.problemes.join(' | '));
  assert.ok(r.problemes.some((p) => /non reconnu/.test(p)), r.problemes.join(' | '));
});

test('appuis : « J\'ai relu » met à jour la DÉCLARATION du seul texte choisi (chiffre et sens), date la relecture, laisse les autres textes intacts', () => {
  const faux = DIGEST.replace(/(- Dordogne \(24\) : \*\*)7,9 %(\*\* \(2e trimestre 2026)/, '$18,9 %$2');
  const avant = appuis.controlerAppuis(faux, APPUIS);
  assert.ok(alertesDe(avant, 'Lecture du territoire | Dordogne').length > 0);
  const r = appuis.alignerAppuis(faux, APPUIS, 'Lecture du territoire | Dordogne', '2026-11-07');
  assert.ok(r.ok, r.erreur);
  assert.ok(r.modifies >= 2, 'modifications : ' + r.modifies);
  const apres = appuis.controlerAppuis(faux, r.texte);
  assert.deepEqual(alertesDe(apres, 'Lecture du territoire | Dordogne'), [], 'le texte relu n\'a plus d\'alerte');
  assert.ok(alertesDe(apres, 'Synthèse courte | Dordogne (24)').length > 0, 'l\'autre texte (non relu) garde son alerte');
  assert.match(r.texte, /relu_le: 2026-11-07/);
  // idempotent : relire deux fois ne change plus rien, sauf la date
  const r2 = appuis.alignerAppuis(faux, r.texte, 'Lecture du territoire | Dordogne', '2026-11-07');
  assert.equal(r2.texte, r.texte);
});

test('appuis : « J\'ai relu » sur un texte inconnu est refusé', () => {
  const r = appuis.alignerAppuis(DIGEST, APPUIS, 'Lecture du territoire | Mars', '2026-11-07');
  assert.equal(r.ok, false);
  assert.ok(!/[–—]/.test(r.erreur));
});

test('appuis : aucun tiret long dans le fichier d\'appuis ni dans les messages', () => {
  assert.ok(!/[–—]/.test(APPUIS));
  const faux = DIGEST.replace(/(- Dordogne \(24\) : \*\*)7,9 %(\*\* \(2e trimestre 2026)/, '$18,9 %$2');
  const r = appuis.controlerAppuis(faux, APPUIS);
  assert.ok(!/[–—]/.test(JSON.stringify(r)));
});
