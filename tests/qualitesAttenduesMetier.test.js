const test = require('node:test');
const assert = require('node:assert');
const { _cvQualitesSimilaires } = require('../modules/cv-core/normaliserDonneesCV.js');

test('LOT 3.3 : deux qualités identiques ou quasi identiques sont la même', () => {
  assert.strictEqual(_cvQualitesSimilaires('Écoute', 'écoute.'), true);
  assert.strictEqual(_cvQualitesSimilaires('Écoute active', 'Écoute'), true);
  assert.strictEqual(_cvQualitesSimilaires('Organisé', 'Organisation'), true);
  assert.strictEqual(_cvQualitesSimilaires('Esprit d\'équipe', 'Travail en équipe'), true);
  assert.strictEqual(_cvQualitesSimilaires('Discipline', 'Sens de la discipline'), true);
});

test('LOT 3.3 : des qualités différentes ne sont pas confondues', () => {
  assert.strictEqual(_cvQualitesSimilaires('Sens de la hiérarchie', 'Sens du service'), false);
  assert.strictEqual(_cvQualitesSimilaires('Gestion du stress', 'Gestion du temps'), false);
  assert.strictEqual(_cvQualitesSimilaires('Rigueur', 'Patience'), false);
  assert.strictEqual(_cvQualitesSimilaires('', 'Rigueur'), false);
});

const { _cvAssemblerParPriorite } = require('../modules/cv-core/normaliserDonneesCV.js');
test('R.4 : assemblage par priorité (personne, fiche, secteur, assistant), une seule apparition par idée, celle de la source la plus haute', () => {
  const r = _cvAssemblerParPriorite(['Patience', 'Écoute', 'Sens du service'], [
    { origine: 'fiche', liste: ['Empathie', 'Écoute', 'Bienveillance', 'Travail en équipe'] },
    { origine: 'secteur', liste: ['Empathie', 'Respect de la dignité et de l\'intimité', 'Discrétion et secret professionnel', 'Rigueur', 'Écoute', 'Travail en équipe'] },
    { origine: 'assistant', liste: [{ competence: 'Discrétion professionnelle' }, { competence: 'Vigilance' }, { competence: '' }, { competence: 'Rigueur' }] }
  ]);
  assert.deepStrictEqual(Array.from(r.map((x) => x.competence)),
    ['Empathie', 'Bienveillance', 'Travail en équipe', 'Respect de la dignité et de l\'intimité', 'Discrétion et secret professionnel', 'Rigueur', 'Vigilance']);
  assert.strictEqual(r.find((x) => x.competence === 'Empathie').origine, 'fiche');
  assert.strictEqual(r.find((x) => x.competence === 'Rigueur').origine, 'secteur');
  assert.strictEqual(r.find((x) => x.competence === 'Vigilance').origine, 'assistant');
});
