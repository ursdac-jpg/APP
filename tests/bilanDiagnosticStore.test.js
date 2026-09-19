const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanStoreDefinirCandidature, bilanStoreObtenirCandidature,
  bilanStoreMettreAJourCvCandidature,
  bilanStoreDefinirDiagnostic, bilanStoreObtenirDiagnostic,
  bilanStoreAjouterDemandeAmelioration, bilanStoreObtenirDemandeAmelioration,
  bilanStoreAjouterPropositionAmelioration, bilanStoreObtenirPropositionAmelioration,
  bilanStoreReinitialiser, bilanStoreExporterEtat, bilanStoreRestaurerEtat
} = require('../modules/bilan-candidature/core/diagnosticStore.js');

beforeEach(() => { bilanStoreReinitialiser(); });

test('bilanStoreDefinirCandidature / bilanStoreObtenirCandidature : aller-retour simple', () => {
  const candidature = { id: 'c1', cv: 'x' };
  bilanStoreDefinirCandidature(candidature);
  assert.equal(bilanStoreObtenirCandidature(), candidature);
});

test('bilanStoreDefinirCandidature : reinitialise diagnostic/demandes/propositions (nouvelle session)', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  bilanStoreDefinirCandidature({ id: 'c2' });
  assert.equal(bilanStoreObtenirDiagnostic(), null);
});

test('bilanStoreDefinirDiagnostic : accepte un diagnostic dont candidatureId correspond a la candidature active', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  const diagnostic = { id: 'diag-1', candidatureId: 'c1' };
  bilanStoreDefinirDiagnostic(diagnostic);
  assert.equal(bilanStoreObtenirDiagnostic(), diagnostic);
});

test('bilanStoreDefinirDiagnostic : leve EtatIncoherent si candidatureId ne correspond pas', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  assert.throws(
    () => bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c-autre' }),
    (erreur) => erreur.code === 'EtatIncoherent'
  );
});

test('bilanStoreDefinirDiagnostic : leve EtatIncoherent si aucune candidature active', () => {
  assert.throws(
    () => bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' }),
    (erreur) => erreur.code === 'EtatIncoherent'
  );
});

test('un seul emplacement "diagnostic" : le definir une seconde fois remplace, ne cumule jamais (invariant 8 par construction)', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-2', candidatureId: 'c1' });
  assert.equal(bilanStoreObtenirDiagnostic().id, 'diag-2');
});

test('bilanStoreAjouterDemandeAmelioration : accepte une demande dont diagnosticSourceId correspond au diagnostic actif', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  const demande = { id: 'dem-1', diagnosticSourceId: 'diag-1' };
  bilanStoreAjouterDemandeAmelioration(demande);
  assert.equal(bilanStoreObtenirDemandeAmelioration('dem-1'), demande);
});

test('bilanStoreAjouterDemandeAmelioration : leve EtatIncoherent si diagnosticSourceId ne correspond pas', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  assert.throws(
    () => bilanStoreAjouterDemandeAmelioration({ id: 'dem-1', diagnosticSourceId: 'diag-autre' }),
    (erreur) => erreur.code === 'EtatIncoherent'
  );
});

test('bilanStoreObtenirDemandeAmelioration : plusieurs demandes coexistent independamment (cycles independants)', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  bilanStoreAjouterDemandeAmelioration({ id: 'dem-1', diagnosticSourceId: 'diag-1' });
  bilanStoreAjouterDemandeAmelioration({ id: 'dem-2', diagnosticSourceId: 'diag-1' });
  assert.equal(bilanStoreObtenirDemandeAmelioration('dem-1').id, 'dem-1');
  assert.equal(bilanStoreObtenirDemandeAmelioration('dem-2').id, 'dem-2');
});

test('bilanStoreObtenirDemandeAmelioration : id inconnu => null, jamais une exception', () => {
  assert.equal(bilanStoreObtenirDemandeAmelioration('inexistant'), null);
});

test('bilanStoreAjouterPropositionAmelioration : accepte une proposition dont demandeAmeliorationId existe', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  bilanStoreAjouterDemandeAmelioration({ id: 'dem-1', diagnosticSourceId: 'diag-1' });
  const proposition = { id: 'prop-1', demandeAmeliorationId: 'dem-1' };
  bilanStoreAjouterPropositionAmelioration(proposition);
  assert.equal(bilanStoreObtenirPropositionAmelioration('dem-1'), proposition);
});

test('bilanStoreAjouterPropositionAmelioration : leve EtatIncoherent si la demande n\'existe pas', () => {
  assert.throws(
    () => bilanStoreAjouterPropositionAmelioration({ id: 'prop-1', demandeAmeliorationId: 'dem-fantome' }),
    (erreur) => erreur.code === 'EtatIncoherent'
  );
});

// TACHE (RC-02, architecture finale, 2026-08-22) : distincte de
// bilanStoreDefinirCandidature ci-dessus -- une correction du texte ne
// doit JAMAIS effacer le diagnostic deja obtenu ni la progression de
// correction en cours (bug reel identifie en revue d'architecture, avant
// meme d'ecrire le code).
test('bilanStoreMettreAJourCvCandidature : met a jour le cv SANS reinitialiser diagnostic/demandes/propositions', () => {
  bilanStoreDefinirCandidature({ id: 'c1', cv: 'texte original' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  bilanStoreAjouterDemandeAmelioration({ id: 'dem-1', diagnosticSourceId: 'diag-1' });
  bilanStoreMettreAJourCvCandidature('texte corrige');
  assert.equal(bilanStoreObtenirCandidature().cv, 'texte corrige');
  assert.equal(bilanStoreObtenirCandidature().id, 'c1');
  assert.equal(bilanStoreObtenirDiagnostic().id, 'diag-1');
  assert.equal(bilanStoreObtenirDemandeAmelioration('dem-1').id, 'dem-1');
});

test('bilanStoreMettreAJourCvCandidature : leve EtatIncoherent si aucune candidature active', () => {
  assert.throws(
    () => bilanStoreMettreAJourCvCandidature('x'),
    (erreur) => erreur.code === 'EtatIncoherent'
  );
});

test('bilanStoreMettreAJourCvCandidature : copie, jamais une mutation de l\'objet candidature original', () => {
  var original = { id: 'c1', cv: 'texte original' };
  bilanStoreDefinirCandidature(original);
  bilanStoreMettreAJourCvCandidature('texte corrige');
  assert.equal(original.cv, 'texte original');
});

test('bilanStoreReinitialiser : vide completement l\'etat', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreReinitialiser();
  assert.equal(bilanStoreObtenirCandidature(), null);
});

// TACHE (disquette -- couverture des modules isoles, 2026-08-25, DECISION DE DENIS)
test('bilanStoreExporterEtat : null si aucune candidature active', () => {
  assert.equal(bilanStoreExporterEtat(), null);
});

test('bilanStoreExporterEtat : capture l\'etat complet (candidature, diagnostic, demandes, propositions)', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  bilanStoreAjouterDemandeAmelioration({ id: 'dem-1', diagnosticSourceId: 'diag-1' });
  const etat = bilanStoreExporterEtat();
  assert.equal(etat.candidature.id, 'c1');
  assert.equal(etat.diagnostic.id, 'diag-1');
  assert.equal(etat.demandesAmelioration['dem-1'].id, 'dem-1');
});

test('bilanStoreRestaurerEtat : restaure exactement l\'etat exporte (aller-retour)', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  bilanStoreDefinirDiagnostic({ id: 'diag-1', candidatureId: 'c1' });
  const etat = bilanStoreExporterEtat();
  bilanStoreReinitialiser();
  bilanStoreRestaurerEtat(etat);
  assert.equal(bilanStoreObtenirCandidature().id, 'c1');
  assert.equal(bilanStoreObtenirDiagnostic().id, 'diag-1');
});

test('bilanStoreRestaurerEtat : etat null remet tout a zero, jamais une exception', () => {
  bilanStoreDefinirCandidature({ id: 'c1' });
  assert.doesNotThrow(() => bilanStoreRestaurerEtat(null));
  assert.equal(bilanStoreObtenirCandidature(), null);
});
