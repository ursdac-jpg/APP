const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctCreerDossierTransversal, ctDossierTransversalEstValide, ctValiderDossierTransversal, ctMarquerConfidentialiteValidee
} = require('../modules/coherence-transversale/modeles/dossierTransversal.js');

test('ctCreerDossierTransversal : assemble cv/lettre obligatoires + champs optionnels', () => {
  const d = ctCreerDossierTransversal({ cv: 'Mon CV', lettre: 'Madame, Monsieur...', offreEmploi: 'Texte de l\'offre' });
  assert.equal(d.cv, 'Mon CV');
  assert.equal(d.lettre, 'Madame, Monsieur...');
  assert.equal(d.offreEmploi, 'Texte de l\'offre');
  assert.equal(d.confidentialiteValidee, false);
});

test('ctCreerDossierTransversal : champs optionnels absents => null, jamais undefined', () => {
  const d = ctCreerDossierTransversal({ cv: 'x', lettre: 'y' });
  assert.equal(d.offreEmploi, null);
  assert.equal(d.entrepriseCiblee, null);
  assert.equal(d.siteEntreprise, null);
  assert.equal(d.preparationEntretien, null);
  assert.equal(d.questionsPersonne, null);
  assert.equal(d.typeStructure, null);
});

test('ctCreerDossierTransversal : typeStructure transmis tel quel si fourni (carte "Votre candidature")', () => {
  const d = ctCreerDossierTransversal({ cv: 'x', lettre: 'y', typeStructure: 'Association (loi 1901) / économie sociale et solidaire' });
  assert.equal(d.typeStructure, 'Association (loi 1901) / économie sociale et solidaire');
});

test('ctCreerDossierTransversal : questionsPersonne transmis tel quel si fourni', () => {
  const d = ctCreerDossierTransversal({ cv: 'x', lettre: 'y', questionsPersonne: 'Ai-je assez insisté sur mon autonomie ?' });
  assert.equal(d.questionsPersonne, 'Ai-je assez insisté sur mon autonomie ?');
});

test('ctCreerDossierTransversal : hashContenu deterministe pour un meme contenu', () => {
  const d1 = ctCreerDossierTransversal({ cv: 'x', lettre: 'y' });
  const d2 = ctCreerDossierTransversal({ cv: 'x', lettre: 'y' });
  assert.equal(d1.hashContenu, d2.hashContenu);
});

// Invariant 1 (CONTRATS.md) : cv ET lettre obligatoires, jamais l'offre.
test('ctDossierTransversalEstValide : cv + lettre presents => valide, meme sans offre (candidature spontanee)', () => {
  assert.equal(ctDossierTransversalEstValide(ctCreerDossierTransversal({ cv: 'x', lettre: 'y' })), true);
});

test('ctDossierTransversalEstValide : cv absent => invalide', () => {
  assert.equal(ctDossierTransversalEstValide(ctCreerDossierTransversal({ lettre: 'y' })), false);
});

test('ctDossierTransversalEstValide : lettre absente => invalide', () => {
  assert.equal(ctDossierTransversalEstValide(ctCreerDossierTransversal({ cv: 'x' })), false);
});

test('ctDossierTransversalEstValide : offre presente seule (sans lettre) => invalide quand meme', () => {
  assert.equal(ctDossierTransversalEstValide(ctCreerDossierTransversal({ cv: 'x', offreEmploi: 'z' })), false);
});

test('ctValiderDossierTransversal : leve DossierTransversalInvalide si cv/lettre manquants', () => {
  assert.throws(() => ctValiderDossierTransversal(ctCreerDossierTransversal({ cv: 'x' })), (e) => e.code === 'DossierTransversalInvalide');
  assert.doesNotThrow(() => ctValiderDossierTransversal(ctCreerDossierTransversal({ cv: 'x', lettre: 'y' })));
});

test('ctMarquerConfidentialiteValidee : passe confidentialiteValidee a true', () => {
  const d = ctCreerDossierTransversal({ cv: 'x', lettre: 'y' });
  ctMarquerConfidentialiteValidee(d, { cv: 'x', lettre: 'y' });
  assert.equal(d.confidentialiteValidee, true);
});

test('ctMarquerConfidentialiteValidee : applique les corrections eventuelles de relecture (cv/lettre modifies)', () => {
  const d = ctCreerDossierTransversal({ cv: 'x original', lettre: 'y original' });
  ctMarquerConfidentialiteValidee(d, { cv: 'x anonymise', lettre: 'y anonymise' });
  assert.equal(d.cv, 'x anonymise');
  assert.equal(d.lettre, 'y anonymise');
});

test('ctMarquerConfidentialiteValidee : applique aussi la correction de preparationEntretien si fournie', () => {
  const d = ctCreerDossierTransversal({ cv: 'x', lettre: 'y', preparationEntretien: 'z original' });
  ctMarquerConfidentialiteValidee(d, { cv: 'x', lettre: 'y', preparationEntretien: 'z anonymise' });
  assert.equal(d.preparationEntretien, 'z anonymise');
});
