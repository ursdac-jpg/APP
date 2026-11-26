'use strict';
// « Retirer une rubrique ou une mission » (plein écran « Régler le CV », 2026-11-25) : la croix n'est posée que sur les titres que le retrait sait traiter.
// Source unique : _PDF_RUBRIQUE_VERS_CONTENU (cvPdfTemplateMaquette.js), lue par le filtre de la feuille ET par le plein écran.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const lire = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('la table des rubriques retirables existe une seule fois et exclut les compétences', () => {
  const modele = lire('modules/cv-pdf-html/cvPdfTemplateMaquette.js');
  assert.strictEqual((modele.match(/var _PDF_RUBRIQUE_VERS_CONTENU = \{\}/g) || []).length, 1, 'une seule définition');
  const lignes = modele.split('\n').filter((l) => /^_PDF_RUBRIQUE_VERS_CONTENU\[_PDF_INTITULES\./.test(l));
  assert.strictEqual(lignes.length, 7);
  ['competencesPro', 'competencesComp', 'competencesEnAction', 'savoirs', 'infos'].forEach((cle) => {
    assert.ok(!lignes.some((l) => l.indexOf('_PDF_INTITULES.' + cle + ']') !== -1), cle + ' ne doit pas avoir de croix');
  });
});

test('le plein écran ne pose la croix que sur les titres de cette table', () => {
  const plein = lire('modules/cv-pdf-html/cvPdfPleinEcranMaquette.js');
  assert.ok(/hasOwnProperty\.call\(_PDF_RUBRIQUE_VERS_CONTENU, h\.getAttribute\('data-rub'\)\)/.test(plein));
});
