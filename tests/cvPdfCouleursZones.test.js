const { test } = require('node:test');
const assert = require('node:assert/strict');
const Z = require('../modules/cv-pdf-html/cvPdfCouleursZones.js');

test('zones de couleur : chaque zone a un id unique, un nom, un type connu', () => {
  const ids = Z._PDF_ZONES_COULEUR.map((z) => z.id);
  assert.equal(new Set(ids).size, ids.length);
  Z._PDF_ZONES_COULEUR.forEach((z) => {
    assert.ok(z.nom && z.clic);
    assert.ok(['globale', 'fixe', 'texte'].includes(z.suit));
    if (z.suit !== 'texte') { assert.ok(z.regles.length > 0, z.id + ' : une zone de fond a au moins une regle'); }
  });
});

test('zones de couleur : liees par defaut, seul false dissocie', () => {
  assert.equal(Z._pdfZonesLieesEffectif(undefined), true);
  assert.equal(Z._pdfZonesLieesEffectif(true), true);
  assert.equal(Z._pdfZonesLieesEffectif(false), false);
});

test('zones de couleur : rien a ecrire sans choix, ou avec une couleur invalide', () => {
  assert.equal(Z._pdfCssCouleursZones(undefined, true), '');
  assert.equal(Z._pdfCssCouleursZones({}, false), '');
  assert.equal(Z._pdfCssCouleursZones({ lateral: { c: 'rouge' } }, false), '');
  assert.equal(Z._pdfCssCouleursZones({ lateral: { c: '#12345' } }, false), '');
});

test('zones de couleur : une zone « fixe » a toujours sa couleur, liees ou non', () => {
  [true, false, undefined].forEach((liees) => {
    const css = Z._pdfCssCouleursZones({ lateral: { c: '#3A7D44' } }, liees);
    assert.ok(css.includes('.cv-frise .fr-lat') && css.includes('background: #3a7d44 !important'), 'liees=' + liees);
  });
});

test('zones de couleur : une zone qui suit la generale n\'a pas de couleur propre tant que c\'est lie', () => {
  const choix = { entete: { c: '#c0392b' } };
  assert.equal(Z._pdfCssCouleursZones(choix, true), '');
  assert.equal(Z._pdfCssCouleursZones(choix, undefined), '');
  const css = Z._pdfCssCouleursZones(choix, false);
  assert.ok(css.includes('.cv .tete-fond') && css.includes('.cv .tete-diag::before') && css.includes('#c0392b'));
});

test('zones de couleur : le degrade reste sur la meme teinte et s\'eclaircit', () => {
  const css = Z._pdfCssCouleursZones({ lateral: { c: '#2f6690', d: true } }, false);
  assert.ok(/linear-gradient\(165deg, #2f6690, color-mix\(in srgb, #2f6690 55%, #ffffff\)\)/.test(css));
  const uni = Z._pdfCssCouleursZones({ lateral: { c: '#2f6690', d: false } }, false);
  assert.ok(!uni.includes('linear-gradient'));
});

test('zones de couleur : le texte des titres n\'a jamais de regle propre', () => {
  assert.equal(Z._pdfCssCouleursZones({ titres: { c: '#000000' } }, false), '');
});

test('zones de couleur : chaque regle porte !important pour passer devant les regles du modele', () => {
  const tout = {}; Z._PDF_ZONES_COULEUR.forEach((z) => { tout[z.id] = { c: '#112233' }; });
  const css = Z._pdfCssCouleursZones(tout, false);
  const regles = css.split('}').filter(Boolean);
  assert.ok(regles.length >= 7);
  regles.forEach((r) => assert.ok(r.includes('!important')));
});

test('contraste : noir sur blanc = 21, identiques = 1, symetrique', () => {
  assert.equal(Math.round(Z._pdfRatioContraste('#000000', '#ffffff')), 21);
  assert.equal(Z._pdfRatioContraste('#336699', '#336699'), 1);
  assert.equal(Z._pdfRatioContraste('#123456', '#ffffff'), Z._pdfRatioContraste('#ffffff', '#123456'));
  assert.equal(Z._pdfRatioContraste('rouge', '#ffffff'), null);
});

test('contraste : valeurs connues (gris #777 sur blanc ~ 4,48 ; le gris-bleu de la frise sur du vert est illisible)', () => {
  const r = Z._pdfRatioContraste('#777777', '#ffffff');
  assert.ok(r > 4.4 && r < 4.6, String(r));
  assert.ok(Z._pdfRatioContraste('#5f7288', '#2e7d5b') < 3, 'gris-bleu sur vert : contraste faible');
  assert.ok(Z._pdfRatioContraste('#14202e', '#93aac6') >= 6, 'texte fonce sur la colonne bleue d origine : tres lisible');
});

test('contraste : verdicts selon la taille du texte', () => {
  assert.equal(Z._pdfVerdictContraste(5, false), 'bon');
  assert.equal(Z._pdfVerdictContraste(4, false), 'limite');
  assert.equal(Z._pdfVerdictContraste(4, true), 'bon');   // grand texte : 3 suffit
  assert.equal(Z._pdfVerdictContraste(2.5, true), 'faible');
  assert.equal(Z._pdfVerdictContraste(null, false), 'bon');
});

test('contraste : extremite du degrade est plus claire que la couleur, meme teinte', () => {
  const fin = Z._pdfExtremiteDegrade('#2e7d5b');
  assert.ok(Z._pdfLuminanceRelative(fin) > Z._pdfLuminanceRelative('#2e7d5b'));
  assert.equal(Z._pdfExtremiteDegrade('#000000'), '#737373');
  assert.equal(Z._pdfExtremiteDegrade('#ffffff'), '#ffffff');
});
