const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// L'historique des écartées dans l'outil de veille (consigne 185, 09/11/2026) : les écrans doivent demander la raison, montrer le bloc « Écartées »,
// offrir « Remettre dans le sas », et donner la liste à Claude (jamais aux assistants en ligne).
const racine = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(racine, 'outils', 'veille.html'), 'utf8');
const serveur = fs.readFileSync(path.join(racine, 'outils', 'serveur_veille.js'), 'utf8');
const commande = fs.readFileSync(path.join(racine, '.claude', 'commands', 'veille.md'), 'utf8');

test('les quatre raisons sont proposées, avec les mots de Denis', () => {
  ['Ne concerne pas mon public', 'Déjà couvert par une fiche', 'Information fausse ou périmée', 'Autre raison'].forEach((m) => assert.ok(html.includes(m), m));
  assert.ok(/data-ecart-motif/.test(html) && /data-ecart-precision/.test(html));
});

test('« Enregistrer » refuse d\'écarter sans raison et dit lequel', () => {
  assert.ok(/function ecartManques\(\)/.test(html));
  assert.ok(/Dites pourquoi vous écartez/.test(html));
  assert.ok(/op: 'ecarter', id: id, motif: e\.m/.test(html), 'changements : écarter avec le motif');
  assert.ok(/op: 'ecarter', id: id, motif: eF\.m/.test(html), 'fiches : écarter avec le motif');
});

test('le bloc « Écartées » est lu au serveur et permet de remettre dans le sas', () => {
  assert.ok(/appeler\('\/api\/ecartes\/lister'/.test(html));
  assert.ok(/function ecarteesHtml\(\)/.test(html) && /Remettre dans le sas/.test(html));
  assert.ok(/type: 'ecartes', actions: \[\{ op: 'remettre'/.test(html));
  assert.ok(/case '\/api\/ecartes\/lister'/.test(serveur));
});

test('la liste des écartées est donnée à Claude dans les deux messages, et la commande /veille la respecte', () => {
  assert.strictEqual((html.match(/blocEcartees\(\)/g) || []).length, 3, 'une définition et deux emplois (carte seule, message complet)');
  assert.ok(/ne redépose jamais/i.test(commande) && /ecartes\.sas\.txt/.test(commande));
  assert.ok(!/blocEcartees/.test(html.slice(html.indexOf('function consignesTri'), html.indexOf('function consignesTri') + 3000)), 'rien dans les consignes données aux assistants en ligne');
});

test('aucun tiret long dans ce qui a été ajouté', () => {
  const morceau = html.slice(html.indexOf('Historique de ce qui est écarté'), html.indexOf('function chgRendre()'));
  assert.ok(morceau.length > 500);
  assert.ok(!/—|–/.test(morceau));
});

test('employeurs : la raison est demandée à l\'écart, « Simple doublon » ne note rien, le bloc « Écartées » filtre et note à la main', () => {
  ['Fermeture confirmée', 'Absent du territoire', 'Site disparu, entreprise introuvable', 'Simple doublon : ne rien noter', 'Noter un employeur disparu', 'Retirer de l’historique'].forEach((m) => assert.ok(html.includes(m), m));
  assert.ok(/data-sas-ecart=/.test(html) && /function sasEcartZoneHtml\(/.test(html));
  assert.ok(/op: 'ecarter', id: id, motif: ee\.m/.test(html), 'le sas envoie la raison');
  assert.ok(/op: 'noter'/.test(html) && /data-ecart-filtre/.test(html));
  assert.ok(/l\.statut === 'ecartee'/.test(html), 'l\'analyse d\'un collage dit « déjà écartée »');
  assert.ok(/scripts\/employeurEcarte\.js/.test(commande) && fs.existsSync(path.join(racine, 'scripts', 'employeurEcarte.js')));
  assert.ok(!/—|–/.test(fs.readFileSync(path.join(racine, 'scripts', 'employeurEcarte.js'), 'utf8')));
});

test('les écartées ne sont plus sous les propositions : un bouton « Fiches écartées » les affiche à la demande (Denis, 10/11/2026)', () => {
  const rendu = html.slice(html.indexOf('function chgRendre()'), html.indexOf('function chgCompter('));
  assert.ok(/data-chg-ecartees="1"/.test(rendu) && /Fiches écartées \(/.test(rendu), 'le bouton est à côté des filtres');
  assert.strictEqual((rendu.match(/ecarteesHtml\(\)/g) || []).length, 1, 'une seule apparition, dans la vue écartées');
  assert.ok(/if \(ec\) \{ h \+= ecarteesHtml\(\); \}/.test(rendu), 'affichées seulement dans la vue écartées');
  assert.ok(/chg\.vueEcartees = !chg\.vueEcartees/.test(html), 'le bouton bascule la vue');
  assert.ok(/chg\.vueEcartees = !!chg\.versEcartees/.test(html), 'le renvoi « Voir les employeurs écartés » ouvre la vue écartées');
  assert.ok(/e\.titre, e\.motifLibelle, e\.precision, e\.lieu/.test(html), 'chercher un mot filtre aussi les écartées');
});
