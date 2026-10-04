const test = require('node:test');
const assert = require('node:assert');
const { _cvSansMissionsRedondantes } = require('../modules/cv-core/normaliserDonneesCV.js');

test('une mission identique a l\'employeur ou au poste est retiree, le reste est conserve', () => {
  const r = _cvSansMissionsRedondantes([
    { poste: 'Congé sabbatique', entreprise: 'Pause professionnelle volontaire', missions: 'Pause professionnelle volontaire.' },
    { poste: 'Chargée de formation', entreprise: 'La Poste', missions: 'Chargée de formation\nSuivi des tableaux de bord' }
  ]);
  assert.strictEqual(r[0].missions, '');
  assert.strictEqual(r[1].missions, 'Suivi des tableaux de bord');
});

test('sans redondance, l\'experience est rendue telle quelle (meme objet)', () => {
  const e = { poste: 'A', entreprise: 'B', missions: 'Une vraie mission' };
  assert.strictEqual(_cvSansMissionsRedondantes([e])[0], e);
});
