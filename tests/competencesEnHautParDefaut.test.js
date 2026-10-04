// « Compétences en haut » par défaut (décision de Denis, 2026-10-01, deux versions le même jour) : OUI sur tout modèle de la maquette, à une comme à
// deux colonnes. La case cochée ou décochée à la main reste prioritaire (gérée par le panneau, pas par cette fonction).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const contexte = {
  normaliserPourComparaison: (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-core/certifications.js', 'utf8'), contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateA4.js', 'utf8'), contexte);

test('modèle de la maquette, une colonne : compétences en haut par défaut', () => {
  assert.equal(contexte._pdfCompetencesEnHautParDefaut({ creatifActif: true, gabaritMaquette: 'bandeau', colonnes: 1 }), true);
  assert.equal(contexte._pdfCompetencesEnHautParDefaut({ gabaritMaquette: 'bandeau' }), true);
});

test('modèle de la maquette, deux colonnes : compétences en haut par défaut', () => {
  assert.equal(contexte._pdfCompetencesEnHautParDefaut({ creatifActif: true, gabaritMaquette: 'bandeau', colonnes: 2 }), true);
  assert.equal(contexte._pdfCompetencesEnHautParDefaut({ gabaritMaquette: 'colonne' }), true);
});

test('modèle qui n’est pas de la maquette : jamais en haut par défaut', () => {
  assert.equal(contexte._pdfCompetencesEnHautParDefaut({ creatifActif: true, colonnes: 2 }), false);
});
