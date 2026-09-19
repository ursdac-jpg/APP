const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  composeurAppliquerReglagesProjetXXL,
  COMPOSEUR_THEME_PROJETXXL
} = require('../modules/cv-composeur/composeurTheme.js');

test('sans reglages : retombe sur le theme de base Projet XXL', () => {
  const theme = composeurAppliquerReglagesProjetXXL();
  assert.equal(theme.id, 'projetxxl');
  assert.equal(theme.colonnes, COMPOSEUR_THEME_PROJETXXL.colonnes);
  assert.equal(theme.coloration, 'aucune');
  assert.equal(theme.styleTitres, 'simple');
});

test('colonnes : seules les valeurs 1 ou 2 sont acceptees, sinon valeur de base', () => {
  assert.equal(composeurAppliquerReglagesProjetXXL(null, { colonnes: 1 }).colonnes, 1);
  assert.equal(composeurAppliquerReglagesProjetXXL(null, { colonnes: 2 }).colonnes, 2);
  assert.equal(composeurAppliquerReglagesProjetXXL(null, { colonnes: 3 }).colonnes, COMPOSEUR_THEME_PROJETXXL.colonnes);
});

test('police : doit appartenir a la liste autorisee, sinon police de base', () => {
  const theme = composeurAppliquerReglagesProjetXXL(null, { police: 'Georgia' });
  assert.equal(theme.police.titres, 'Georgia');
  assert.equal(theme.police.corps, 'Georgia');

  const themeInvalide = composeurAppliquerReglagesProjetXXL(null, { police: 'PoliceInexistante' });
  assert.equal(themeInvalide.police.titres, COMPOSEUR_THEME_PROJETXXL.police.titres);
});

test('lectureGuidee + rectangle -> styleTitres bandeau, sinon simple', () => {
  const bandeau = composeurAppliquerReglagesProjetXXL(null, { coloration: 'lectureGuidee', lectureGuideeVariante: 'rectangle' });
  assert.equal(bandeau.styleTitres, 'bandeau');

  const titre = composeurAppliquerReglagesProjetXXL(null, { coloration: 'lectureGuidee', lectureGuideeVariante: 'titre' });
  assert.equal(titre.styleTitres, 'simple');

  const texteColore = composeurAppliquerReglagesProjetXXL(null, { coloration: 'texteColore' });
  assert.equal(texteColore.styleTitres, 'simple');
});

test('garde-fou : lectureGuidee + fondColonnesEffet titres -> retombe sur fondSeul', () => {
  const theme = composeurAppliquerReglagesProjetXXL(null, {
    coloration: 'lectureGuidee',
    fondColonnes: 'gauche',
    fondColonnesEffet: 'titres'
  });
  assert.equal(theme.fondColonnesEffet, 'fondSeul');
});

test('garde-fou : fondColonnes aucun -> fondColonnesEffet force a fondSeul', () => {
  const theme = composeurAppliquerReglagesProjetXXL(null, { fondColonnes: 'aucun', fondColonnesEffet: 'titres' });
  assert.equal(theme.fondColonnesEffet, 'fondSeul');
});

test('garde-fou : fondTete + 2 colonnes + fondColonnes lesDeux -> fondTete force a false', () => {
  const theme = composeurAppliquerReglagesProjetXXL(null, { colonnes: 2, fondTete: true, fondColonnes: 'lesDeux' });
  assert.equal(theme.fondTete, false);
});

test('fondTete reste actif si fondColonnes n est pas lesDeux, meme en 2 colonnes', () => {
  const theme = composeurAppliquerReglagesProjetXXL(null, { colonnes: 2, fondTete: true, fondColonnes: 'gauche' });
  assert.equal(theme.fondTete, true);
});

test('bonus : capaciteExperiencesBonus et missionsBonus sont bornes et jamais negatifs', () => {
  assert.equal(composeurAppliquerReglagesProjetXXL(null, { capaciteExperiencesBonus: 50 }).capaciteExperiencesBonus, 10);
  assert.equal(composeurAppliquerReglagesProjetXXL(null, { capaciteExperiencesBonus: -3 }).capaciteExperiencesBonus, 0);
  assert.equal(composeurAppliquerReglagesProjetXXL(null, { missionsBonus: 50 }).missionsBonus, 5);
  assert.equal(composeurAppliquerReglagesProjetXXL(null, {}).missionsBonus, 0);
});

test('bonusCapacites : une valeur par rubrique, bornee a 10, defaut 0', () => {
  const theme = composeurAppliquerReglagesProjetXXL(null, { bonusCapacites: { loisirs: 25, formations: 2 } });
  assert.equal(theme.bonusCapacites.loisirs, 10);
  assert.equal(theme.bonusCapacites.formations, 2);
  assert.equal(theme.bonusCapacites.langues, 0);
});
