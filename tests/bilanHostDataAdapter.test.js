const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bilanLireDonneesBrutesCandidat, bilanLireDonneesStructureesAnalyse, bilanLireDonneesStructureesCorrection, bilanLecteursParDefaut } = require('../modules/bilan-candidature/collecte/hostDataAdapter.js');

function lecteursDeTest(valeurs) {
  valeurs = valeurs || {};
  return {
    lireCv: () => valeurs.cv,
    lireMetierVise: () => valeurs.metierVise,
    lireEntrepriseCiblee: () => valeurs.entrepriseCiblee,
    lireSiteEntreprise: () => valeurs.siteEntreprise,
    lireOffreEmploi: () => valeurs.offreEmploi,
    lireTypeStructure: () => valeurs.typeStructure,
    lireObjectifCandidature: () => valeurs.objectif,
    lireNombreExperiencesProfessionnelles: () => valeurs.nombreExperiencesProfessionnelles,
    lireExperiencesDates: () => valeurs.experiencesDates,
    lireExperiencesTexte: () => valeurs.experiencesTexte,
    lireStructurationDisponible: () => valeurs.structurationDisponible
  };
}

test('bilanLireDonneesBrutesCandidat : transmet les valeurs des lecteurs injectes', () => {
  const brut = bilanLireDonneesBrutesCandidat(lecteursDeTest({ cv: 'Mon CV', metierVise: 'Boulanger', entrepriseCiblee: 'Boulangerie Dupont' }));
  assert.equal(brut.cv, 'Mon CV');
  assert.equal(brut.metierVise, 'Boulanger');
  assert.equal(brut.entrepriseCiblee, 'Boulangerie Dupont');
});

test('bilanLireDonneesBrutesCandidat : champs absents => null, jamais undefined', () => {
  const brut = bilanLireDonneesBrutesCandidat(lecteursDeTest({ cv: 'Mon CV' }));
  assert.equal(brut.metierVise, null);
  assert.equal(brut.entrepriseCiblee, null);
  assert.equal(brut.siteEntreprise, null);
  assert.equal(brut.objectif, null);
  assert.equal(brut.nombreExperiencesProfessionnelles, 0);
});

test('bilanLireDonneesBrutesCandidat : transmet siteEntreprise tel quel', () => {
  const brut = bilanLireDonneesBrutesCandidat(lecteursDeTest({
    cv: 'Mon CV',
    siteEntreprise: 'https://boulangerie-dupont.fr'
  }));
  assert.equal(brut.siteEntreprise, 'https://boulangerie-dupont.fr');
});

// TACHE (posture prioritaire pour profil reconversion/debutant, 2026-08-24)
test('bilanLireDonneesBrutesCandidat : objectif et nombreExperiencesProfessionnelles transmis tels quels', () => {
  const brut = bilanLireDonneesBrutesCandidat(lecteursDeTest({ cv: 'Mon CV', objectif: 'reconversion', nombreExperiencesProfessionnelles: 3 }));
  assert.equal(brut.objectif, 'reconversion');
  assert.equal(brut.nombreExperiencesProfessionnelles, 3);
});

test('bilanLireDonneesBrutesCandidat : cv absent => chaine vide, jamais null (contrat Candidature.cv: string)', () => {
  const brut = bilanLireDonneesBrutesCandidat(lecteursDeTest({}));
  assert.equal(brut.cv, '');
});

// TACHE (transfert Coherence transversale -> Bilan, 2026-08-25, DECISION
// DE DENIS) : offreEmploi/typeStructure exposes desormais en repli
// (dossier.rechercheCandidature.texteOffre/.typeStructure, memorises
// app-wide par le module Coherence transversale) -- regle "jamais expose"
// perimee depuis ce chantier, voir en-tete de hostDataAdapter.js.
test('bilanLireDonneesBrutesCandidat : offreEmploi/typeStructure transmis en repli (memorises app-wide par Coherence transversale)', () => {
  const brut = bilanLireDonneesBrutesCandidat(lecteursDeTest({ cv: 'x', offreEmploi: 'Texte de l\'offre', typeStructure: 'Association (loi 1901) / économie sociale et solidaire' }));
  assert.equal(brut.offreEmploi, 'Texte de l\'offre');
  assert.equal(brut.typeStructure, 'Association (loi 1901) / économie sociale et solidaire');
});

test('bilanLireDonneesBrutesCandidat : offreEmploi/typeStructure absents => null, jamais undefined', () => {
  const brut = bilanLireDonneesBrutesCandidat(lecteursDeTest({ cv: 'x' }));
  assert.equal(brut.offreEmploi, null);
  assert.equal(brut.typeStructure, null);
});

test('bilanLireDonneesStructureesAnalyse : transmet experiencesDates tel quel', () => {
  const structure = bilanLireDonneesStructureesAnalyse(lecteursDeTest({
    experiencesDates: [{ dateDebut: 2019, dateFin: 2021 }]
  }));
  assert.deepEqual(structure.experiencesDates, [{ dateDebut: 2019, dateFin: 2021 }]);
});

// TACHE (retour utilisateur : coherence anonymisation/alertes, 2026-08-10) :
// coordonnees retire -- plus aucun consommateur depuis la suppression du
// detecteur associe (analyse/faitsExtractor.js).
test('bilanLireDonneesStructureesAnalyse : n\'expose plus de champ coordonnees', () => {
  const structure = bilanLireDonneesStructureesAnalyse(lecteursDeTest({}));
  assert.equal('coordonnees' in structure, false);
});

test('bilanLireDonneesStructureesAnalyse : n\'expose jamais cv/metierVise (perimetre distinct de DonneesBrutesCandidat)', () => {
  const structure = bilanLireDonneesStructureesAnalyse(lecteursDeTest({}));
  assert.equal('cv' in structure, false);
  assert.equal('metierVise' in structure, false);
});

test('bilanLireDonneesStructureesCorrection : transmet experiencesTexte et structurationDisponible tels quels', () => {
  const structure = bilanLireDonneesStructureesCorrection(lecteursDeTest({
    experiencesTexte: [{ index: 0, poste: 'Vendeur', texte: 'Vendeur. Accueil client.' }],
    structurationDisponible: true
  }));
  assert.deepEqual(structure.experiencesTexte, [{ index: 0, poste: 'Vendeur', texte: 'Vendeur. Accueil client.' }]);
  assert.equal(structure.structurationDisponible, true);
});

test('bilanLireDonneesStructureesCorrection : champs absents => tableau vide / false, jamais undefined', () => {
  const structure = bilanLireDonneesStructureesCorrection(lecteursDeTest({}));
  assert.deepEqual(structure.experiencesTexte, []);
  assert.equal(structure.structurationDisponible, false);
});

test('bilanLireDonneesStructureesCorrection : n\'expose jamais cv/metierVise/experiencesDates (perimetre distinct)', () => {
  const structure = bilanLireDonneesStructureesCorrection(lecteursDeTest({}));
  assert.equal('cv' in structure, false);
  assert.equal('experiencesDates' in structure, false);
});

// ---------- bilanLecteursParDefaut().lireCv (chantier "titre et accroche
// du CV", 2026-08-25, correctif de coherence) : seul lecteur de ce fichier
// avec une logique propre (pas un simple passe-plat vers une fonction
// globale) -- teste ici en simulant les globales du navigateur, jamais
// injecte via lecteursDeTest() ci-dessus (qui ne couvre que le passe-plat
// generique de bilanLireDonneesBrutesCandidat). ----------

test('lireCv : accroche existante (dossier.ia.cv.profil) -> ajoutee a la suite du texte de base', () => {
  global.texteProfilEffectif = () => 'Texte de base du CV.';
  global.dossier = { ia: { cv: { profil: 'Professionnelle engagée, 5 ans d’expérience.' } } };
  try {
    const texte = bilanLecteursParDefaut().lireCv();
    assert.ok(texte.indexOf('Texte de base du CV.') !== -1);
    assert.ok(texte.indexOf('Professionnelle engagée, 5 ans d’expérience.') !== -1);
    assert.ok(texte.indexOf('PHRASE D’ACCROCHE DÉJÀ PRÉSENTE') !== -1);
  } finally {
    delete global.texteProfilEffectif;
    delete global.dossier;
  }
});

test('lireCv : aucune accroche existante -> texte de base seul, jamais de section ajoutee', () => {
  global.texteProfilEffectif = () => 'Texte de base du CV.';
  global.dossier = { ia: { cv: {} } };
  try {
    const texte = bilanLecteursParDefaut().lireCv();
    assert.equal(texte, 'Texte de base du CV.');
  } finally {
    delete global.texteProfilEffectif;
    delete global.dossier;
  }
});

test('lireCv : dossier.ia absent -> jamais une exception (defense en profondeur)', () => {
  global.texteProfilEffectif = () => 'Texte de base du CV.';
  global.dossier = {};
  try {
    assert.doesNotThrow(() => bilanLecteursParDefaut().lireCv());
  } finally {
    delete global.texteProfilEffectif;
    delete global.dossier;
  }
});

// ---------- lireSiteEntreprise/lireLettreTexte/lireEntretienTexte
// (chantier "Coherence transversale CV/lettre/entretien", 2026-08-25) ----------

test('lireSiteEntreprise : relaie siteCibleActuel() tel quel', () => {
  global.siteCibleActuel = () => 'https://boulangerie-dupont.fr';
  try {
    assert.equal(bilanLecteursParDefaut().lireSiteEntreprise(), 'https://boulangerie-dupont.fr');
  } finally {
    delete global.siteCibleActuel;
  }
});

test('lireSiteEntreprise : fonction globale absente -> chaine vide, jamais une exception', () => {
  assert.doesNotThrow(() => bilanLecteursParDefaut().lireSiteEntreprise());
  assert.equal(bilanLecteursParDefaut().lireSiteEntreprise(), '');
});
