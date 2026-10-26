'use strict';
// TABLE DES CAPACITES PAR MODELE (modules/cv-pdf-html/cvPdfCapacitesModeles.js, generee par scripts/rendu/capacites_ecrire.js depuis la mesure du banc de rendu).
// Regle de Denis (2026-10-20) : un modele ne propose que les options qu'il permet. Ce test garde l'accord entre la table, le registre du banc et les lecteurs.
// Regeneration : voir l'en-tete de scripts/rendu/capacites_ecrire.js.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const racine = path.join(__dirname, '..');
const registre = JSON.parse(fs.readFileSync(path.join(racine, 'scripts', 'rendu', 'registre.json'), 'utf8'));
const source = fs.readFileSync(path.join(racine, 'modules', 'cv-pdf-html', 'cvPdfCapacitesModeles.js'), 'utf8');
const contexte = {};
vm.createContext(contexte);
vm.runInContext(source + '\nthis.T = _CV_CAPACITES_MODELES; this.cap = _cvCapacitesModele; this.permet = _cvModelePermet; this.formes = _cvFormesPourModele;', contexte);
// Le contexte vm a ses propres tableaux : on les ramène à ceux de ce test pour comparer.
const table = JSON.parse(JSON.stringify(contexte.T));
const copieListe = (l) => JSON.parse(JSON.stringify(l));

const NIVEAUX = ['natif', 'ajoutable', 'non'];
const BORDS_BANDEAU = ['droit', 'arrondi', 'vallonne', 'pointe', 'diagonale', 'coin', 'demiovale', 'vague2', 'creneaux', 'carte', 'pilule', 'ruban', 'rubanCourt', 'contour', 'contourRond', 'filets'];
const FORMES_COLONNE_PLUS = ['diagonale', 'pointeBas', 'coin', 'demiovale', 'vague2', 'creneaux', 'carte', 'pilule', 'contour', 'contourRond', 'filets'];
const BORDS_COLONNE = ['droit', 'vallonne', 'arche'].concat(FORMES_COLONNE_PLUS);

test('la table couvre le Standard et chaque modèle du registre, sans modèle en trop', () => {
  const attendus = ['standard'].concat(Object.keys(registre)).sort();
  assert.deepStrictEqual(Object.keys(table).sort(), attendus);
});

test('chaque ligne est complète et ne dit que des valeurs connues', () => {
  Object.keys(table).forEach((c) => {
    const l = table[c];
    assert.ok(NIVEAUX.includes(l.bandeau), c + ' : bandeau inconnu (' + l.bandeau + ')');
    assert.ok(NIVEAUX.includes(l.colonne), c + ' : colonne inconnue (' + l.colonne + ')');
    assert.ok(Array.isArray(l.formesBandeau) && l.formesBandeau.every((f) => BORDS_BANDEAU.includes(f)), c + ' : formes de bandeau inconnues');
    assert.ok(Array.isArray(l.formesColonne) && l.formesColonne.every((f) => BORDS_COLONNE.includes(f)), c + ' : formes de colonne inconnues');
  });
});

test('aucune forme proposée pour un élément que le modèle ne peut pas avoir', () => {
  Object.keys(table).forEach((c) => {
    const l = table[c];
    if (l.formesBandeau.length) { assert.notStrictEqual(l.bandeau, 'non', c + ' : des formes de bandeau sans bandeau'); }
    if (l.formesColonne.length) { assert.notStrictEqual(l.colonne, 'non', c + ' : des formes de colonne sans colonne'); }
  });
});

test('les formes de la table suivent le registre du banc : bord de départ, bandeau natif, arche jamais avec un bandeau natif', () => {
  Object.keys(registre).forEach((c) => {
    const l = table[c];
    // Une colonne à bord au choix a toujours « droit » et « vallonne » ; l'arche s'y ajoute seulement quand le gabarit la rend.
    // Étape 4.2 : une colonne « ajoutable » (le CV passe à deux colonnes avec un fond de colonne) a ses formes sans que le rendu de base, à une colonne, ait un bord ; une colonne native doit avoir les deux.
    const aChoix = l.formesColonne.includes('droit') && l.formesColonne.includes('vallonne');
    if (l.colonne === 'ajoutable') { assert.ok(aChoix && !registre[c].bord, c + ' : colonne ajoutable : formes dans la table, pas de bord au rendu de base à une colonne'); }
    else { assert.strictEqual(aChoix, !!registre[c].bord, c + ' : choix de la colonne différent du registre'); }
    if (l.bandeau === 'natif' && registre[c].bandeau) { assert.ok(l.formesBandeau.length > 0, c + ' : le registre donne un bord de bandeau de départ mais la table ne propose aucune forme'); }
    if (l.bandeau === 'natif' && l.formesBandeau.length) { assert.ok(!l.formesColonne.includes('arche'), c + ' : arche impossible avec un bandeau coloré natif'); }
  });
});

test('les lecteurs répondent comme la table, et prudemment pour un modèle inconnu', () => {
  assert.strictEqual(contexte.cap('creatif:inconnu'), null);
  assert.strictEqual(contexte.permet('creatif:inconnu', 'bandeau'), false);
  assert.deepStrictEqual(copieListe(contexte.formes('creatif:inconnu', 'colonne')), []);
  Object.keys(table).forEach((c) => {
    ['bandeau', 'colonne'].forEach((k) => {
      assert.strictEqual(contexte.permet(c, k), table[c][k] !== 'non', c + ' ' + k);
    });
  });
  const copie = contexte.formes('creatif:mqBandeau', 'bandeau');
  copie.push('x');
  assert.ok(!contexte.formes('creatif:mqBandeau', 'bandeau').includes('x'), 'le lecteur doit rendre une copie');
});

test('des points d\'appui connus de la table (garde-fou contre une mesure qui dériverait)', () => {
  assert.deepStrictEqual(table['creatif:mqBandeau'].formesBandeau, BORDS_BANDEAU, 'Bandeau entier propose les quatre bords de bandeau');
  assert.deepStrictEqual(table['creatif:colonneFoncee'].formesColonne, BORDS_COLONNE, 'Colonne foncée propose droite, vallonnée et arche');
  assert.strictEqual(table['creatif:colonneFoncee'].bandeau, 'ajoutable', 'Colonne foncée peut recevoir un bandeau');
  assert.deepStrictEqual(table['creatif:colonneFoncee'].formesBandeau, BORDS_BANDEAU, 'Colonne foncée propose les quatre bords de bandeau quand elle en a un');
  assert.strictEqual(table['creatif:colonneBandeau'].colonne, 'natif');
  assert.strictEqual(table['creatif:colonneBandeau'].bandeau, 'natif');
  assert.deepStrictEqual(table['creatif:colonneBandeau'].formesColonne, ['droit', 'vallonne'].concat(FORMES_COLONNE_PLUS), 'Colonne et bandeau : pas d\'arche, le bandeau cache le haut de la colonne');
  assert.deepStrictEqual(table['creatif:colonneClaire'].formesColonne, BORDS_COLONNE, 'Colonne claire : la carte est devenue la forme « Carte flottante » de départ, toutes les formes de colonne sont derrière (étape 4.2)');
  // Étape 4.2 : tout CV qui peut passer à deux colonnes avec une colonne colorée propose les formes de colonne, Standard et Sobre compris
  // (étape 4.4 : les six modèles Sobre à colonne jamais colorée l'ont aussi, en teinte douce)
  ['standard', 'creatif:mqBandeau', 'creatif:cadreBarre', 'creatif:medaillon', 'sobre:mq-epure', 'sobre:mq-fond', 'sobre:mq-bandeau', 'sobre:mq-editorial', 'sobre:mq-editorial-large', 'sobre:mq-technique', 'sobre:mq-cartes', 'sobre:mq-cartes-couleurs', 'sobre:mq-grille'].forEach((c) => {
    assert.ok(['ajoutable', 'natif'].includes(table[c].colonne), c + ' peut avoir une colonne colorée');
    assert.ok(table[c].formesColonne.length >= 13, c + ' propose les formes de colonne');
  });
  assert.strictEqual(table['standard'].colonne, 'ajoutable', 'le Standard passe à deux colonnes avec un fond de colonne');
  // jamais de forme de colonne là où le modèle n'a pas de colonne dessinée (structure propre, colonne jamais colorée)
  ['creatif:frise', 'creatif:friseFoncee', 'creatif:photoFrise', 'creatif:rectangles', 'sobre:mq-photo', 'sobre:mq-rectangles'].forEach((c) => {
    assert.deepStrictEqual(table[c].formesColonne, [], c + ' : pas de forme de colonne');
  });
  assert.strictEqual(table['sobre:mq-editorial'].colonne, 'ajoutable', 'Sobre éditorial peut recevoir une colonne douce (étape 4.4)');
  assert.strictEqual(table['sobre:mq-photo'].bandeau, 'non', 'Sobre photo : rien (décision de Denis, étape 4.4)');
  assert.strictEqual(table['sobre:mq-rectangles'].bandeau, 'ajoutable', 'Sobre rectangles : bandeau doux (étape 4.4, famille 3)');
  assert.ok(!table['sobre:mq-rectangles'].formesBandeau.includes('contour') && table['sobre:mq-rectangles'].formesBandeau.includes('demiovale'), 'Sobre rectangles : pas de forme vide, les autres formes oui');
  assert.strictEqual(table['creatif:rectangles'].bandeau, 'non', 'Rectangles (Créatif) : rien (étape 4.4, famille 3)');
  assert.strictEqual(table['creatif:rectangles'].colonne, 'non', "Rectangles : pas de colonne colorée (le .rc-col est la grille de l'en-tête)");
  assert.strictEqual(table['sobre:mq-bandeau'].bandeau, 'natif', 'Bandeau pâle a son bandeau d\'office');
});
