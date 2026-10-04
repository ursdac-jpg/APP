const test = require('node:test');
const assert = require('node:assert');
const { _cvRepartirExperiencesPersonnelles } = require('../modules/cv-core/normaliserDonneesCV.js');

const pro = [{ poste: 'Aide à domicile', entreprise: 'ADMR', dateDebut: '2018', dateFin: '2020', missions: 'Toilette' }];

test('par défaut une expérience personnelle reste personnelle et n\'entre pas dans le professionnel', () => {
  const r = _cvRepartirExperiencesPersonnelles(pro, [{ intitule: 'Accompagnement de personnes âgées', dateDebut: '2015', dateFin: '2017', missions: 'Repas' }]);
  assert.strictEqual(r.experiences.length, 1);
  assert.strictEqual(r.experiencesPersonnelles.length, 1);
});

test('remontée demandée avec date de début : passe en professionnel et disparaît du personnel, une seule fois', () => {
  const r = _cvRepartirExperiencesPersonnelles(pro, [
    { intitule: 'Accompagnement de personnes âgées', dateDebut: '2015', dateFin: '', missions: 'Repas', remonteeEnPro: true, entreprise: '', lieu: 'Limoges' },
    { intitule: 'Bénévolat', dateDebut: '2010', dateFin: '2012', missions: '', remonteeEnPro: false }
  ]);
  assert.strictEqual(r.experiences.length, 2);
  assert.strictEqual(r.experiences[1].poste, 'Accompagnement de personnes âgées');
  assert.strictEqual(r.experiences[1].entreprise, '');
  assert.strictEqual(r.experiences[1].lieu, 'Limoges');
  assert.strictEqual(r.experiences[1].dateDebut, '2015');
  assert.strictEqual(r.experiences[1].missions, 'Repas');
  assert.deepStrictEqual(r.experiencesPersonnelles.map(e => e.intitule), ['Bénévolat']);
});

test('sans date de début, la remontée est ignorée : l\'expérience reste personnelle (jamais de perte)', () => {
  const r = _cvRepartirExperiencesPersonnelles([], [{ intitule: 'Foyer', dateDebut: '', remonteeEnPro: true }]);
  assert.strictEqual(r.experiences.length, 0);
  assert.strictEqual(r.experiencesPersonnelles.length, 1);
});

test('le tableau des expériences professionnelles reçu n\'est pas modifié', () => {
  const copie = pro.slice();
  _cvRepartirExperiencesPersonnelles(pro, [{ intitule: 'X', dateDebut: '2000', remonteeEnPro: true }]);
  assert.deepStrictEqual(pro, copie);
});
