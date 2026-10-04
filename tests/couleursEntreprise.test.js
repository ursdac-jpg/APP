/* ============================================================
   tests/couleursEntreprise.test.js  (2026-09-26)
   Jusqu'a trois couleurs d'entreprise : lecture de la reponse de l'assistant (jamais plus de 3, jamais une valeur inventee) et
   correction automatique du contraste (la couleur de marque est gardee, la couleur appliquee au CV reste lisible).
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const c = require('../modules/cv-core/couleursEntreprise.js');

test('normaliserCouleursEntrepriseIA : liste de 0 a 3 couleurs, majuscules, sans doublon, jamais plus de trois', () => {
  assert.deepStrictEqual(c.normaliserCouleursEntrepriseIA(['#00a19a', '00A19A', '#123456', '#abcdef', '#111111']), ['#00A19A', '#123456', '#ABCDEF']);
  assert.deepStrictEqual(c.normaliserCouleursEntrepriseIA([]), []);
  assert.deepStrictEqual(c.normaliserCouleursEntrepriseIA(null), []);
});

test('normaliserCouleursEntrepriseIA : une valeur qui n\'est pas une couleur est ignoree ; l\'ancien champ (une seule couleur) reste lu', () => {
  assert.deepStrictEqual(c.normaliserCouleursEntrepriseIA(['rouge', '#12345', '#ffcc00']), ['#FFCC00']);
  assert.deepStrictEqual(c.normaliserCouleursEntrepriseIA(null, '#00A19A'), ['#00A19A']);
  assert.deepStrictEqual(c.normaliserCouleursEntrepriseIA('#00A19A'), ['#00A19A']);
});

test('couleursEntrepriseDuDossier : les trous sont combles, les couleurs invalides ignorees', () => {
  assert.deepStrictEqual(c.couleursEntrepriseDuDossier({ couleurEntreprise: '', couleurEntreprise2: '#00A19A', couleurEntreprise3: 'x' }),
    { liste: ['#00a19a'], principale: '#00a19a', secondaire: '', details: '' });
  const r = c.couleursEntrepriseDuDossier({ couleurEntreprise: '#111111', couleurEntreprise2: '#222222', couleurEntreprise3: '#333333' });
  assert.strictEqual(r.liste.length, 3);
  assert.strictEqual(r.details, '#333333');
  assert.strictEqual(c.couleursEntrepriseDuDossier(null).liste.length, 0);
});

test('contraste : une principale trop claire est assombrie (texte blanc lisible), une principale deja sombre est gardee', () => {
  const jaune = c.couleurPourTexteBlanc('#FFD400');
  assert.ok(c.rapportContrasteCouleurs(jaune, '#ffffff') >= 4.5, 'le jaune ajuste doit etre lisible avec du texte blanc : ' + jaune);
  assert.notStrictEqual(jaune, '#ffd400');
  assert.strictEqual(c.couleurPourTexteBlanc('#1F3A5F'), '#1f3a5f');
});

test('contraste : des details (fond de pastilles) trop fonces sont eclaircis (texte sombre lisible), les teintes deja claires sont gardees', () => {
  const marine = c.couleurPourTexteSombre('#0B2545');
  assert.ok(c.rapportContrasteCouleurs(marine, '#1c2430') >= 4.5, 'le marine ajuste doit accepter du texte sombre : ' + marine);
  assert.notStrictEqual(marine, '#0b2545');
  assert.strictEqual(c.couleurPourTexteSombre('#F4E9C1'), '#f4e9c1');
});

test('couleursEntrepriseAppliquees : la couleur de marque du dossier n\'est jamais modifiee, seule la couleur appliquee l\'est', () => {
  const rc = { couleurEntreprise: '#FFD400', couleurEntreprise2: '#0B2545' };
  const avant = JSON.stringify(rc);
  const a = c.couleursEntrepriseAppliquees(rc);
  assert.strictEqual(JSON.stringify(rc), avant);
  assert.strictEqual(a.nombre, 2);
  assert.ok(a.principale && a.secondaire && !a.details);
  assert.ok(c.rapportContrasteCouleurs(a.principale, '#ffffff') >= 4.5);
  assert.ok(c.rapportContrasteCouleurs(a.secondaire, '#ffffff') >= 3, 'la secondaire sert de 2e teinte du degrade, sous du texte blanc');
});
