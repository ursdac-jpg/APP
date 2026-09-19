const { test } = require('node:test');
const assert = require('node:assert/strict');

const { BILAN_DESTINATION_PAR_AXE, bilanChoisirAxePrincipal, bilanDestinationPourAxe } = require('../modules/bilan-candidature/correction/destinationRegistry.js');
const { BILAN_CATALOGUE_AXES } = require('../modules/bilan-candidature/analyse/axeAnalyseRegistry.js');

test('BILAN_DESTINATION_PAR_AXE : couvre les 10 axes du vrai catalogue, aucun de plus, aucun de moins', () => {
  const idsAxes = BILAN_CATALOGUE_AXES.map((a) => a.id).sort();
  const idsDestination = Object.keys(BILAN_DESTINATION_PAR_AXE).sort();
  assert.deepEqual(idsDestination, idsAxes);
});

// TACHE (correctif audit Niveau 2, 2026-08-11) : dossier.metierCible se
// choisit dans le bloc Candidature (verifie dans js/app.js), pas dans un
// bloc "Projet professionnel" distinct -- voir destinationRegistry.js
// pour le detail de la correction.
test('bilanDestinationPourAxe : retourne cible + libelle pour un axe connu', () => {
  const dest = bilanDestinationPourAxe('adequation');
  assert.equal(dest.cible, 'candidature');
  assert.equal(typeof dest.libelle, 'string');
});

test('bilanDestinationPourAxe : plus aucun axe ne route vers l\'ancienne cible retiree "projet-professionnel"', () => {
  const cibles = Object.values(BILAN_DESTINATION_PAR_AXE).map((d) => d.cible);
  assert.equal(cibles.includes('projet-professionnel'), false);
});

// TACHE (brique 3, correction du 2026-08-10) : lisibilite route vers une
// relecture complete du CV, jamais vers un ecran precis -- voir l'en-tete
// de destinationRegistry.js ("DECISION (brique 3)") pour les deux raisons
// (fonctionnelle ET technique, pageResultats() etant un parcours verrouille).
test('bilanDestinationPourAxe : lisibilite route vers texte-libre, jamais vers un ecran precis', () => {
  const dest = bilanDestinationPourAxe('lisibilite');
  assert.equal(dest.cible, 'texte-libre');
});

// TACHE (chantier "Coherence transversale CV/lettre/entretien", 2026-08-25,
// DECISION DE DENIS) : cet axe est retire du catalogue du Bilan V1 (deplace
// vers un module et un prompt dedies) -- plus aucune entree ici.
test('bilanDestinationPourAxe : coherence_transversale n\'existe plus dans ce registre (deplace vers un module dedie)', () => {
  const dest = bilanDestinationPourAxe('coherence_transversale');
  assert.equal(dest, null);
});

test('bilanDestinationPourAxe : null pour un axe inconnu (defense en profondeur)', () => {
  assert.equal(bilanDestinationPourAxe('axe_invente'), null);
});

test('bilanChoisirAxePrincipal : un seul axe -> le retourne tel quel', () => {
  assert.equal(bilanChoisirAxePrincipal(['lisibilite'], BILAN_CATALOGUE_AXES), 'lisibilite');
});

test('bilanChoisirAxePrincipal : plusieurs axes -> le plus determinant l\'emporte (poids)', () => {
  // lisibilite = amplificateur, credibilite = determinant : credibilite doit gagner,
  // quel que soit l'ordre de depart dans dimensionsLiees.
  assert.equal(bilanChoisirAxePrincipal(['lisibilite', 'credibilite'], BILAN_CATALOGUE_AXES), 'credibilite');
  assert.equal(bilanChoisirAxePrincipal(['credibilite', 'lisibilite'], BILAN_CATALOGUE_AXES), 'credibilite');
});

test('bilanChoisirAxePrincipal : differenciateur l\'emporte sur amplificateur/contextuel', () => {
  assert.equal(bilanChoisirAxePrincipal(['personnalisation', 'coherence', 'posture'], BILAN_CATALOGUE_AXES), 'coherence');
});

test('bilanChoisirAxePrincipal : ignore les axes inconnus, retient le premier axe connu restant', () => {
  assert.equal(bilanChoisirAxePrincipal(['axe_invente', 'lisibilite'], BILAN_CATALOGUE_AXES), 'lisibilite');
});

test('bilanChoisirAxePrincipal : tableau vide ou tous axes inconnus -> null', () => {
  assert.equal(bilanChoisirAxePrincipal([], BILAN_CATALOGUE_AXES), null);
  assert.equal(bilanChoisirAxePrincipal(['axe_invente'], BILAN_CATALOGUE_AXES), null);
});
