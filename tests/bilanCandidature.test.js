const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerCandidature, bilanCandidatureEstValide, bilanValiderCandidature,
  bilanRecalculerHashCandidature, bilanMarquerConfidentialiteValidee
} = require('../modules/bilan-candidature/modeles/candidature.js');

test('bilanCreerCandidature : confidentialiteValidee toujours false a la creation', () => {
  const candidature = bilanCreerCandidature({ id: 'c1', cv: 'Mon CV', dateCreation: '2026-08-08' });
  assert.equal(candidature.confidentialiteValidee, false);
  assert.equal(candidature.cv, 'Mon CV');
  assert.equal(typeof candidature.hashContenu, 'string');
});

test('bilanCreerCandidature : champs optionnels absents => null, jamais undefined', () => {
  const candidature = bilanCreerCandidature({ id: 'c1', cv: 'Mon CV' });
  assert.equal(candidature.metierVise, null);
  assert.equal(candidature.offreEmploi, null);
  assert.equal(candidature.entrepriseCiblee, null);
  assert.equal(candidature.siteEntreprise, null);
  assert.equal(candidature.typeStructure, null);
  assert.equal(candidature.typeStructureAutre, null);
});

// TACHE (ciblage offre d'emploi, 2026-08-24, demande de Denis)
test('bilanCreerCandidature : siteEntreprise/typeStructure/typeStructureAutre transportes tels quels', () => {
  const candidature = bilanCreerCandidature({
    cv: 'Mon CV', siteEntreprise: 'https://exemple.fr',
    typeStructure: 'Autre', typeStructureAutre: 'Coopérative agricole'
  });
  assert.equal(candidature.siteEntreprise, 'https://exemple.fr');
  assert.equal(candidature.typeStructure, 'Autre');
  assert.equal(candidature.typeStructureAutre, 'Coopérative agricole');
});

test('bilanCandidatureEstValide : seul cv non vide est requis', () => {
  assert.equal(bilanCandidatureEstValide(bilanCreerCandidature({ cv: 'texte' })), true);
  assert.equal(bilanCandidatureEstValide(bilanCreerCandidature({ cv: '' })), false);
  assert.equal(bilanCandidatureEstValide(bilanCreerCandidature({ cv: '   ' })), false);
  assert.equal(bilanCandidatureEstValide(bilanCreerCandidature({})), false);
});

test('bilanValiderCandidature : leve CandidatureInvalide si cv vide', () => {
  assert.throws(() => bilanValiderCandidature(bilanCreerCandidature({})), (erreur) => erreur.code === 'CandidatureInvalide');
});

test('bilanValiderCandidature : ne leve rien si cv present', () => {
  assert.doesNotThrow(() => bilanValiderCandidature(bilanCreerCandidature({ cv: 'texte' })));
});

test('bilanRecalculerHashCandidature : le hash change si le cv change', () => {
  const candidature = bilanCreerCandidature({ cv: 'version A' });
  const hashInitial = candidature.hashContenu;
  candidature.cv = 'version B';
  bilanRecalculerHashCandidature(candidature);
  assert.notEqual(candidature.hashContenu, hashInitial);
});

test('bilanMarquerConfidentialiteValidee : seul point de passage vers true, applique le contenu relu', () => {
  const candidature = bilanCreerCandidature({ cv: 'texte avec un nom sensible' });
  bilanMarquerConfidentialiteValidee(candidature, 'texte relu, nom retire');
  assert.equal(candidature.confidentialiteValidee, true);
  assert.equal(candidature.cv, 'texte relu, nom retire');
});
