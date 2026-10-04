const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

// Le panneau du CV est un script de navigateur : on vérifie ici les règles écrites dans sa source (l'exécution réelle est vérifiée en navigateur).
const source = fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfPanneauReglages.js', 'utf8');
const gabarit = fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateMaquette.js', 'utf8');
const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8');

test('position des dates : par défaut, les formations et l\'expérience personnelle suivent les expériences', () => {
  assert.ok(source.includes('var _cvPdfDatesAlignees = true;'));
  assert.ok(source.includes('if (_cvPdfDatesAlignees) { return _cvPdfPositionDatesChoisie ? _cvPdfPositionDates : ""; }'));
});

test('position des dates : sans choix, les formations et l’expérience personnelle prennent la position des expériences (celle du modèle comprise)', () => {
  // retour Denis 2026-09-30 : par défaut, les expériences donnent le sens des dates à toutes les rubriques
  assert.ok(source.includes('positionDatesFormations: _pdfPositionDatesRubrique("formations")'));
  assert.ok(gabarit.includes("var posDefautRubriques = (opts.datesAlignees === false) ? '' : positionDates;"));
  assert.ok(gabarit.includes("(['droite', 'sous', 'avant'].indexOf(opts.positionDatesFormations) !== -1) ? opts.positionDatesFormations : posDefautRubriques"));
  assert.ok(gabarit.includes('if (posDatesForm) {'));
});

test('position des dates : l\'état est sauvegardé, restauré et remis à zéro', () => {
  ['datesAlignees', 'positionDatesFormations', 'positionDatesPerso'].forEach((cle) => {
    assert.ok(source.includes('etat.' + cle + ' = '), 'sauvegarde de ' + cle);
    assert.ok(source.includes('etat.' + cle + ' ||') || source.includes('etat.' + cle + ' ==='), 'restauration de ' + cle);
  });
  assert.ok(app.includes("'datesAlignees', 'positionDatesFormations', 'positionDatesPerso'"));
});

test('position des dates : les quatre dispositions et l\'expérience personnelle sont couvertes', () => {
  assert.ok(gabarit.includes("posDatesForm === 'droite' || posDatesForm === 'sous'"));
  assert.ok(gabarit.includes("posDatesForm === 'avant' || posDatesForm === 'droite'"));
  assert.ok(gabarit.includes('if (posDatesPerso) {'));
  assert.ok(gabarit.includes("posDatesPerso === 'avant' || posDatesPerso === 'droite'"));
});

test('ordre de l’expérience personnelle : état sauvegardé, restauré, remis à zéro ; par défaut rien ne change', () => {
  assert.ok(gabarit !== undefined);
  const a4 = fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateA4.js', 'utf8');
  assert.ok(a4.includes("if (critereExpPerso !== 'pertinence') {"), 'le défaut « pertinence » ne touche à rien');
  ['ordreExpPerso', 'ordreExpPersoMien'].forEach((cle) => {
    assert.ok(source.includes('etat.' + cle + ' = '), 'sauvegarde de ' + cle);
    assert.ok(source.includes('etat.' + cle + ' ||'), 'restauration de ' + cle);
  });
  assert.ok(app.includes("'ordreExpPersoMien', 'ordreExpPerso'"));
});
