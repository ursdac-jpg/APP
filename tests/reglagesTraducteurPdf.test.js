const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reglagesMiseEnPageParDefaut, fusionnerReglagesMiseEnPage } =
  require('../modules/cv-mise-en-page/reglagesMiseEnPage.js');
const { traduireVersRegPdf } = require('../modules/cv-mise-en-page/reglagesTraducteurs.js');

// _PDF_ETAT_DEFAUT verbatim (cvPdfPanneauReglages.js ~3255-3266) + les 4
// valeurs que le traducteur produit en plus (inputs a defaut "11" pour les
// echelles, regFormationsMisesEnAvant / regCreatifActif a false). Si le
// traducteur s'ecarte de cet etat pour le CANON par defaut, le test tombe.
const PDF_DEFAUT_ATTENDU = {
  regFormatCV: 'A4-detaille',
  regColonnes: '2', regColonnesInversees: false, regSeparateurColonnes: false, regFormeColonnes: 'rectangle', regLargeurColonneGauche: '35',
  regCouleurDebut: '#2f6690', regCouleurFin: '#d9e8f2', regFondColonnes: 'droite', regFondColonnesEffet: 'fondSeul', regDegradeColonnes: 'fonce-clair',
  regBandeauEnTete: true, regFormeEnTete: 'rectangle', regDegradeBandeau: 'fonce-clair', regBandeauDisponibilite: false, regAnneauPhoto: false,
  regStyleTitres: 'souligne', regLectureGuidee: false, regStyleProfessionnel: 'epure', regStylePersonnel: 'epure', regStyleBordures: 'fine', regIcones: false, regIconesCoordonnees: false, regPolice: 'segoe', regTexteFondColonnes: 'blanc', regBandeauCompetencesCles: false,
  regStyleCompetences: 'pastille', regCouleurFondCompetences: '#e9e9e9', regCouleurTextePuces: '#1b1b1b',
  regCoinsArrondis: false, regFondColonnesA5: 'droite', regEnteteInverseeA5: false, regRemplirPageA5: false, regSansAccroche: false, regPositionLibreEntete: true, regLargeurAccrocheLibre: '30', regLargeurMetierLibre: '32', regFondColonnePleineHauteur: false,
  regLettreJointe: false, regRegroupementActif: false, regOrdreExperiences: 'pertinence', regFormatExperiences: 'standard', regDispositionEntete: '3colonnes',
  regSoulignerPoste: false, regItaliquePoste: false, regSoulignerDates: false, regItaliqueDates: false, regSoulignerEntreprise: false, regItaliqueEntreprise: false,
  regSobreActif: false,
  // en plus de _PDF_ETAT_DEFAUT :
  regEchelle: '11', regEchelleA5: '11', regFormationsMisesEnAvant: false, regCreatifActif: false
};

test('traducteur PDF : le CANON par defaut reproduit _PDF_ETAT_DEFAUT a l\'identique', () => {
  assert.deepEqual(traduireVersRegPdf(reglagesMiseEnPageParDefaut()), PDF_DEFAUT_ATTENDU);
});

const trad = (patch) => traduireVersRegPdf(
  fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), patch));

test('traducteur PDF : format canon -> valeur reg (A4/A5 en capitales)', () => {
  assert.equal(trad({ format: 'a4-detaille' }).regFormatCV, 'A4-detaille');
  assert.equal(trad({ format: 'a4-essentiel' }).regFormatCV, 'A4-essentiel');
  assert.equal(trad({ format: 'a4-integral' }).regFormatCV, 'A4-integral');
  assert.equal(trad({ format: 'a5-portrait' }).regFormatCV, 'A5-portrait');
  assert.equal(trad({ format: 'a5-paysage' }).regFormatCV, 'A5-paysage');
});

test('traducteur PDF : degrade "uni" (canon) -> "aucun" (reg), sur colonnes ET bandeau', () => {
  const r = trad({ degradeColonnes: 'uni', degradeBandeau: 'uni' });
  assert.equal(r.regDegradeColonnes, 'aucun');
  assert.equal(r.regDegradeBandeau, 'aucun');
  const r2 = trad({ degradeColonnes: 'clair-fonce' });
  assert.equal(r2.regDegradeColonnes, 'clair-fonce');
});

test('traducteur PDF : styleTitres "sans-decor" -> "aucun"', () => {
  assert.equal(trad({ styleTitres: 'sans-decor' }).regStyleTitres, 'aucun');
  assert.equal(trad({ styleTitres: 'bandeau' }).regStyleTitres, 'bandeau');
  assert.equal(trad({ styleTitres: 'pastille' }).regStyleTitres, 'pastille');
});

test('traducteur PDF : styleCompetences "texte-seul" -> "texte"', () => {
  assert.equal(trad({ styleCompetences: 'texte-seul' }).regStyleCompetences, 'texte');
  assert.equal(trad({ styleCompetences: 'rectangle' }).regStyleCompetences, 'rectangle');
});

test('traducteur PDF : ordreExperiences canon -> valeur reg', () => {
  assert.equal(trad({ ordreExperiences: 'pertinence' }).regOrdreExperiences, 'pertinence');
  assert.equal(trad({ ordreExperiences: 'recentes' }).regOrdreExperiences, 'date-desc');
  assert.equal(trad({ ordreExperiences: 'anciennes' }).regOrdreExperiences, 'date-asc');
  assert.equal(trad({ ordreExperiences: 'poste-az' }).regOrdreExperiences, 'poste-asc');
});

test('traducteur PDF : les nombres deviennent des chaines', () => {
  const r = trad({ largeurColonneGauche: 40, largeurAccrocheLibre: 70, largeurMetierLibre: 45, taille: 12.5, echelleA5: 13 });
  assert.equal(r.regLargeurColonneGauche, '40');
  assert.equal(r.regLargeurAccrocheLibre, '70');
  assert.equal(r.regLargeurMetierLibre, '45');
  assert.equal(r.regEchelle, '12.5');
  assert.equal(r.regEchelleA5, '13');
  assert.equal(r.regColonnes, '2');
});

test('traducteur PDF : maps souligner/italique -> 6 cases plates', () => {
  const r = trad({ souligner: { poste: true, dates: true }, italique: { entreprise: true } });
  assert.equal(r.regSoulignerPoste, true);
  assert.equal(r.regItaliquePoste, false);
  assert.equal(r.regSoulignerDates, true);
  assert.equal(r.regSoulignerEntreprise, false);
  assert.equal(r.regItaliqueEntreprise, true);
});

test('traducteur PDF : allure -> regSobreActif / regCreatifActif (exclusives)', () => {
  const sobre = trad({ allure: 'sobre' });
  assert.equal(sobre.regSobreActif, true);
  assert.equal(sobre.regCreatifActif, false);
  const creatif = trad({ allure: 'creatif' });
  assert.equal(creatif.regSobreActif, false);
  assert.equal(creatif.regCreatifActif, true);
  const def = trad({ allure: 'defaut' });
  assert.equal(def.regSobreActif, false);
  assert.equal(def.regCreatifActif, false);
});

test('traducteur PDF : couleurs en minuscules', () => {
  const r = trad({ accent: '#2F6690', accentClair: '#D9E8F2' });
  assert.equal(r.regCouleurDebut, '#2f6690');
  assert.equal(r.regCouleurFin, '#d9e8f2');
});

test('traducteur PDF : passe-plats booleens', () => {
  const r = trad({ colonnesInversees: true, separateurColonnes: true, bandeauEnTete: false, anneauPhoto: true, coinsArrondis: true, lectureGuidee: true, icones: true, sansAccroche: true, regroupement: true, formationsMisesEnAvant: true });
  assert.equal(r.regColonnesInversees, true);
  assert.equal(r.regSeparateurColonnes, true);
  assert.equal(r.regBandeauEnTete, false);
  assert.equal(r.regAnneauPhoto, true);
  assert.equal(r.regCoinsArrondis, true);
  assert.equal(r.regLectureGuidee, true);
  assert.equal(r.regIcones, true);
  assert.equal(r.regSansAccroche, true);
  assert.equal(r.regRegroupementActif, true);
  assert.equal(r.regFormationsMisesEnAvant, true);
});

test('traducteur PDF : n\'emet PAS les champs sans input reg* (interligne, marges, rubriques...)', () => {
  const r = traduireVersRegPdf(reglagesMiseEnPageParDefaut());
  ['interligne', 'espacementParas', 'marges', 'alignement', 'densite', 'veuves',
   'rubriques', 'ordreRubriques', 'pages', 'couleurEntrepriseActive', 'nuance',
   'blocMisEnAvant', 'ordreDatesPoste', 'accrocheItalique'].forEach((cle) => {
    assert.ok(!(cle in r), `"${cle}" ne doit pas apparaitre`);
    assert.ok(!('reg' + cle[0].toUpperCase() + cle.slice(1) in r), `"reg${cle}" ne doit pas apparaitre`);
  });
});

test('traducteur PDF : entree vide -> objet complet, jamais d\'exception', () => {
  const r = traduireVersRegPdf();
  assert.equal(r.regFormatCV, 'A4-detaille');
  assert.equal(r.regColonnes, '2');
  assert.equal(r.regBandeauEnTete, true);
  assert.equal(r.regSobreActif, false);
});
