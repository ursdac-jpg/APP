/* ============================================================
   tests/certifications.test.js  (2026-09-26)
   Certifications structurees (intitule, organisme, lieu, date) : lecture du texte « Intitule (organisme, lieu, date) », ecriture inverse,
   affichage comme les formations. Regle d'or : rien n'est invente ni perdu ; une parenthese ambigue reste dans l'intitule.
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const c = require('../modules/cv-core/certifications.js');

test('separer : intitule, organisme, lieu et date', () => {
  assert.deepStrictEqual(c.separerCertification('TOEIC (ETS, Paris, 2023)'), { intitule: 'TOEIC', organisme: 'ETS', lieu: 'Paris', date: '2023' });
  assert.deepStrictEqual(c.separerCertification('CACES R489 (AFTRAL, Limoges, juin 2022)'), { intitule: 'CACES R489', organisme: 'AFTRAL', lieu: 'Limoges', date: 'juin 2022' });
});

test('separer : l\'ordre des informations n\'a pas d\'importance, la date est reconnue partout', () => {
  assert.deepStrictEqual(c.separerCertification('SST (2021, INRS)'), { intitule: 'SST', organisme: 'INRS', lieu: '', date: '2021' });
  assert.deepStrictEqual(c.separerCertification('PSC1 (03/2020)'), { intitule: 'PSC1', organisme: '', lieu: '', date: '03/2020' });
  assert.deepStrictEqual(c.separerCertification('Anglais B2 (2023-06, Cambridge)'), { intitule: 'Anglais B2', organisme: 'Cambridge', lieu: '', date: '2023-06' });
});

test('separer : sans information captee, seul l\'intitule est garde ; rien n\'est invente', () => {
  assert.deepStrictEqual(c.separerCertification('SST'), { intitule: 'SST', organisme: '', lieu: '', date: '' });
  assert.deepStrictEqual(c.separerCertification(''), { intitule: '', organisme: '', lieu: '', date: '' });
  assert.deepStrictEqual(c.separerCertification(null), { intitule: '', organisme: '', lieu: '', date: '' });
});

test('separer : une parenthese ambigue reste dans l\'intitule (developpement d\'un sigle, une seule partie sans date)', () => {
  const r = c.separerCertification('SST (Sauveteur Secouriste du Travail)');
  assert.strictEqual(r.intitule, 'SST (Sauveteur Secouriste du Travail)');
  assert.strictEqual(r.organisme, '');
});

test('separer : deux parties sans date = organisme et lieu ; plusieurs dates = on ne touche a rien', () => {
  assert.deepStrictEqual(c.separerCertification('PSC1 (Croix-Rouge, Limoges)'), { intitule: 'PSC1', organisme: 'Croix-Rouge', lieu: 'Limoges', date: '' });
  assert.strictEqual(c.separerCertification('Formation (2020, 2021)').intitule, 'Formation (2020, 2021)');
});

test('separer : les objets d\'un import structure sont acceptes', () => {
  assert.strictEqual(c.separerCertification({ intitule: 'TOEIC' }).intitule, 'TOEIC');
});

test('composer : l\'inverse de separer, dans le meme format que l\'import ; rien d\'autre que ce que la personne a saisi', () => {
  assert.strictEqual(c.composerCertification({ intitule: 'TOEIC', organisme: 'ETS', lieu: 'Paris', date: '2023' }), 'TOEIC (ETS, Paris, 2023)');
  assert.strictEqual(c.composerCertification({ intitule: 'SST', organisme: '', lieu: '', date: '' }), 'SST');
  assert.strictEqual(c.composerCertification({ intitule: 'SST', date: '2021' }), 'SST (2021)');
  ['TOEIC (ETS, Paris, 2023)', 'SST (INRS, 2021)', 'PSC1 (Croix-Rouge, Limoges)', 'SST', 'CACES R489 (AFTRAL, Limoges, juin 2022)'].forEach((t) => {
    assert.strictEqual(c.composerCertification(c.separerCertification(t)), t, 'aller-retour : ' + t);
  });
});

test('afficher : comme les formations, date a la fin ou en tete selon le modele ; sans information, l\'intitule seul', () => {
  assert.strictEqual(c.afficherCertification('TOEIC (ETS, Paris, 2023)'), 'TOEIC - ETS, Paris - 2023');
  assert.strictEqual(c.afficherCertification('TOEIC (ETS, Paris, 2023)', true), '2023 : TOEIC - ETS, Paris');
  assert.strictEqual(c.afficherCertification('SST'), 'SST');
  assert.strictEqual(c.afficherCertification('SST (Sauveteur Secouriste du Travail)'), 'SST (Sauveteur Secouriste du Travail)');
  assert.strictEqual(c.afficherCertification('PSC1 (2020)', true), '2020 : PSC1');
});
