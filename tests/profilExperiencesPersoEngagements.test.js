const test = require('node:test');
const assert = require('node:assert');
const { _cvProfilLignesExperiencesPerso, _cvProfilEngagements, _cvPeriodeProfil } = require('../modules/cv-core/normaliserDonneesCV.js');

test('LOT 2 : une expérience personnelle envoie ses dates et ses missions à l\'assistant', () => {
  const lignes = _cvProfilLignesExperiencesPerso([{ intitule: 'Aidante familiale', detail: 'Accompagnement quotidien', dateDebut: '2013', dateFin: '2019', missions: 'Organisation des soins' }]);
  assert.strictEqual(lignes.length, 1);
  assert.ok(lignes[0].indexOf('(2013 à 2019)') !== -1, 'période absente : ' + lignes[0]);
  assert.ok(lignes[0].indexOf('Aidante familiale') !== -1 && lignes[0].indexOf(': Accompagnement quotidien') !== -1);
  assert.ok(lignes[0].indexOf(' - Missions : Organisation des soins') !== -1, 'missions absentes : ' + lignes[0]);
});

test('LOT 2 : sans date ni mission, l\'expérience personnelle garde l\'ancien format (aucune parenthèse vide)', () => {
  assert.deepStrictEqual(_cvProfilLignesExperiencesPerso([{ intitule: 'Gestion du foyer', detail: '' }]), ['   . Gestion du foyer']);
});

test('LOT 2 : une expérience en cours porte « en cours »', () => {
  assert.strictEqual(_cvPeriodeProfil('2015', ''), '2015 à en cours');
  assert.strictEqual(_cvPeriodeProfil('', '2019'), '');
});

test('LOT 2 : engagements sans missions = ancien format d\'une seule ligne, inchangé', () => {
  assert.strictEqual(_cvProfilEngagements(['Judo', { texte: 'Restos du cœur', dateDebut: '2015', dateFin: '' }]),
    '- Engagements : Judo, Restos du cœur (2015 - en cours)' + String.fromCharCode(10));
  assert.strictEqual(_cvProfilEngagements([]), '');
});

test('LOT 2 : dès qu\'un engagement a des missions, liste à puces avec ces missions', () => {
  const t = _cvProfilEngagements([{ texte: 'Restos du cœur', dateDebut: '2015', dateFin: '', missions: 'Distribution alimentaire' }, 'Judo']);
  assert.ok(t.indexOf('- Engagements :') === 0);
  assert.ok(t.indexOf('   . Restos du cœur (2015 - en cours) - Missions : Distribution alimentaire') !== -1, t);
  assert.ok(t.indexOf('   . Judo') !== -1);
});
