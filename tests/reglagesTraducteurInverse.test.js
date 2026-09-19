const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reglagesMiseEnPageParDefaut, fusionnerReglagesMiseEnPage } =
  require('../modules/cv-mise-en-page/reglagesMiseEnPage.js');
const {
  traduireVersRegPdf, traduireVersReglagesProjetXXL, traduireVersEtatWord,
  lireDepuisRegPdf, lireDepuisReglagesProjetXXL
} = require('../modules/cv-mise-en-page/reglagesTraducteurs.js');

function pick(o, cles) { const r = {}; cles.forEach((k) => { r[k] = o[k]; }); return r; }

// --- PDF : round-trip complet (le forward etait quasi identite) -------------

// Champs que traduireVersRegPdf emet ET que lireDepuisRegPdf reconstruit.
const CLES_PDF = [
  'format', 'colonnes', 'colonnesInversees', 'separateurColonnes', 'formeColonnes',
  'largeurColonneGauche', 'taille', 'fondColonnesA5', 'enteteInverseeA5', 'remplirPageA5', 'echelleA5',
  'accent', 'accentClair', 'fondColonnes', 'fondColonnesEffet', 'fondColonnePleineHauteur',
  'degradeColonnes', 'texteFondColonnes', 'couleurFondCompetences', 'couleurTextePuces',
  'bandeauEnTete', 'formeEnTete', 'degradeBandeau', 'bandeauDisponibilite', 'dispositionEntete',
  'anneauPhoto', 'positionLibreEntete', 'largeurAccrocheLibre', 'largeurMetierLibre',
  'police', 'styleTitres', 'lectureGuidee', 'styleCompetences', 'icones', 'iconesCoordonnees',
  'styleBordures', 'styleProfessionnel', 'stylePersonnel', 'bandeauCompetencesCles', 'coinsArrondis',
  'souligner', 'italique', 'ordreExperiences', 'formatExperiences', 'sansAccroche', 'lettreJointe',
  'regroupement', 'formationsMisesEnAvant', 'allure'
];

test('inverse PDF : le CANON par defaut fait un aller-retour exact', () => {
  const d = reglagesMiseEnPageParDefaut();
  const rt = lireDepuisRegPdf(traduireVersRegPdf(d));
  assert.deepEqual(pick(rt, CLES_PDF), pick(d, CLES_PDF));
});

test('inverse PDF : aller-retour exact sur une config bien modifiee', () => {
  const c = fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), {
    format: 'a5-paysage', colonnes: '1', colonnesInversees: true, separateurColonnes: true,
    formeColonnes: 'diagonale', largeurColonneGauche: 40, taille: 12.5, echelleA5: 13,
    accent: '#8f3a5c', accentClair: '#f0dde5', fondColonnes: 'lesDeux', fondColonnesEffet: 'titres',
    fondColonnePleineHauteur: true, degradeColonnes: 'uni', texteFondColonnes: 'noir',
    couleurFondCompetences: '#cccccc', couleurTextePuces: '#111111',
    bandeauEnTete: false, formeEnTete: 'diagonale', degradeBandeau: 'clair-fonce',
    bandeauDisponibilite: true, dispositionEntete: '2colonnes', anneauPhoto: true, positionLibreEntete: false,
    largeurAccrocheLibre: 70, largeurMetierLibre: 45, police: 'verdana', styleTitres: 'sans-decor',
    lectureGuidee: true, styleCompetences: 'texte-seul', icones: true, iconesCoordonnees: true,
    styleBordures: 'epaisse', styleProfessionnel: 'condense', stylePersonnel: 'condense',
    bandeauCompetencesCles: true, coinsArrondis: true,
    souligner: { poste: true, entreprise: true }, italique: { dates: true },
    ordreExperiences: 'recentes', formatExperiences: 'ameliore', sansAccroche: true,
    lettreJointe: true, regroupement: true, formationsMisesEnAvant: true, allure: 'creatif'
  });
  const rt = lireDepuisRegPdf(traduireVersRegPdf(c));
  assert.deepEqual(pick(rt, CLES_PDF), pick(c, CLES_PDF));
});

test('inverse PDF : styleTitres et degrade "aucun" -> "sans-decor" / "uni"', () => {
  assert.equal(lireDepuisRegPdf({ regStyleTitres: 'aucun' }).styleTitres, 'sans-decor');
  assert.equal(lireDepuisRegPdf({ regStyleTitres: 'bandeau' }).styleTitres, 'bandeau');
  assert.equal(lireDepuisRegPdf({ regDegradeColonnes: 'aucun' }).degradeColonnes, 'uni');
  assert.equal(lireDepuisRegPdf({ regDegradeColonnes: 'clair-fonce' }).degradeColonnes, 'clair-fonce');
  assert.equal(lireDepuisRegPdf({ regOrdreExperiences: 'date-desc' }).ordreExperiences, 'recentes');
  assert.equal(lireDepuisRegPdf({ regStyleCompetences: 'texte' }).styleCompetences, 'texte-seul');
});

test('inverse PDF : les chaines numeriques redeviennent des nombres', () => {
  const p = lireDepuisRegPdf({ regEchelle: '10.5', regLargeurColonneGauche: '65', regEchelleA5: '9' });
  assert.equal(p.taille, 10.5);
  assert.equal(p.largeurColonneGauche, 65);
  assert.equal(p.echelleA5, 9);
});

// --- Word : round-trip sur le sous-ensemble que le Word sait exprimer ------

const CLES_WORD = [
  'icones', 'iconesCoordonnees', 'fondColonnes', 'fondColonnesEffet', 'texteFondColonnes',
  'fondColonnePleineHauteur', 'bandeauEnTete', 'bandeauDisponibilite', 'separateurColonnes',
  'colonnesInversees', 'styleProfessionnel', 'stylePersonnel', 'ordreDatesPoste', 'accrocheItalique',
  'souligner', 'italique', 'lettreJointe', 'regroupement', 'blocMisEnAvant', 'blocMisEnAvantGauche',
  'blocMisEnAvantDroite', 'couleurEntrepriseActive', 'allure', 'accent', 'colonnes'
];

function roundtripWord(canon, extra) {
  const w = traduireVersEtatWord(canon);
  return lireDepuisReglagesProjetXXL(w.couleur, w.reglagesProjetXXL, extra || {});
}

test('inverse Word : aller-retour exact sur le sous-ensemble exprimable (defaut)', () => {
  const d = reglagesMiseEnPageParDefaut();
  const rt = roundtripWord(d);
  assert.deepEqual(pick(rt, CLES_WORD), pick(d, CLES_WORD));
});

test('inverse Word : aller-retour sur une config modifiee (sous-ensemble)', () => {
  const c = fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), {
    icones: true, iconesCoordonnees: true, fondColonnes: 'gauche', fondColonnesEffet: 'titres',
    texteFondColonnes: 'noir', fondColonnePleineHauteur: true, bandeauEnTete: false,
    bandeauDisponibilite: true, separateurColonnes: true, colonnesInversees: true,
    styleProfessionnel: 'condense', stylePersonnel: 'condense', ordreDatesPoste: 'dates',
    accrocheItalique: false, souligner: { poste: true }, italique: { entreprise: true },
    lettreJointe: true, regroupement: true, blocMisEnAvant: 'competences',
    couleurEntrepriseActive: true, allure: 'sobre', accent: '#1e3a5f', colonnes: '1'
  });
  const rt = roundtripWord(c, { sobreActif: true });
  assert.deepEqual(pick(rt, CLES_WORD), pick(c, CLES_WORD));
});

test('inverse Word : styleTitres "bandeau" et "souligne" reviennent ; lectureGuidee aussi', () => {
  assert.equal(roundtripWord(fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { styleTitres: 'bandeau' })).styleTitres, 'bandeau');
  assert.equal(roundtripWord(fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { styleTitres: 'souligne' })).styleTitres, 'souligne');
  const lg = roundtripWord(fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { lectureGuidee: true, styleTitres: 'souligne' }));
  assert.equal(lg.lectureGuidee, true);
});

test('inverse Word : police 4 valeurs mappables reviennent ; les autres restent absentes', () => {
  assert.equal(roundtripWord(fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { police: 'georgia' })).police, 'georgia');
  assert.equal(roundtripWord(fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { police: 'arial' })).police, 'arial');
  assert.ok(!('police' in roundtripWord(fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { police: 'segoe' }))));
});

test('inverse Word : format via extra (formatPage + modeleA5)', () => {
  const base = reglagesMiseEnPageParDefaut();
  assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', {}, { formatPage: 'A4' }).format, 'a4-detaille');
  assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', {}, { formatPage: 'A4-integral' }).format, 'a4-integral');
  assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', {}, { formatPage: 'A5', modeleA5: 'paysage' }).format, 'a5-paysage');
  assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', {}, { formatPage: 'A5', modeleA5: 'portrait' }).format, 'a5-portrait');
});

test('inverse Word : le patch reste fusionnable et valide', () => {
  const d = reglagesMiseEnPageParDefaut();
  const patch = roundtripWord(fusionnerReglagesMiseEnPage(d, { allure: 'creatif', fondColonnes: 'gauche' }), { creatifActif: true });
  const fusion = fusionnerReglagesMiseEnPage(d, patch);
  assert.equal(fusion.allure, 'creatif');
  assert.equal(fusion.fondColonnes, 'gauche');
});
