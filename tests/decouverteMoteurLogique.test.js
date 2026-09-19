const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// Logique d'orchestration de decouverteMoteur.js (dernier des 6
// fichiers du module "Decouvrir mes competences" a couvrir, chantier
// de stabilisation, 2026-09-13). Ce fichier n'a volontairement AUCUNE
// logique metier propre (voir son entete) : son seul travail est
// d'envelopper chaque appel aux modules coeur dans un try/catch
// centralise et de tracer chaque etape. Les tests portent donc sur ce
// comportement d'orchestration lui-meme -- les fonctions encapsulees
// (analyserReponseDecouverte, declencherRaffinement, etc.) sont des
// globales attendues par ce fichier, remplacees ici par des doublures
// de test controlees plutot que par les vrais modules (deja testes
// pour leur propre compte dans tests/decouverteLogique.test.js et
// tests/decouverteMappingLogique.test.js).
global.analyserReponseDecouverte = function (texte) {
  if (texte === 'exception') { throw new Error('boom-analyse'); }
  return { succes: true, valeurs: { fragments: [1, 2], questionsCiblees: [] } };
};
global.analyserReponseRaffinement = function (texte) {
  if (texte === 'exception') { throw new Error('boom-raffinement'); }
  if (texte === 'echec') { return { succes: false, erreur: 'erreur de lecture' }; }
  return { succes: true, valeurs: { x: 1 } };
};
global.declencherRaffinement = function (etatFragment, valeurs) {
  return { succes: true, etat: 'deuxiemeRaffinement' };
};
global.validerFragment = function (etatFragment, choix) {
  if (choix === 'exception') { throw new Error('boom-validation'); }
  return { succes: true, competencesValidees: [1, 2] };
};
global.proposerStrategie = function (competencesValidees) {
  if (competencesValidees === 'exception') { throw new Error('boom-strategie'); }
  return { metiersProposes: [1, 2, 3], aucunMetierPertinent: false, typeCVRecommande: { type: 'classique' } };
};
global.mapperFragmentsVersDossier = function (fragmentsValides) {
  if (fragmentsValides === 'exception') { throw new Error('boom-mapping'); }
  return { misesAJour: { experiences: [1], competences: { savoirFaire: [1], savoirEtre: [] } }, journalProvenance: [1, 2] };
};
global.appliquerMisesAJourDossier = function (dossierCible) {
  if (dossierCible && dossierCible.exception) { throw new Error('boom-application'); }
  dossierCible.experiences = (dossierCible.experiences || []).concat([1]);
};
global.alert = function () {};

const {
  obtenirJournalExecutionDecouverte,
  _decouverteReinitialiserJournal,
  executerAnalyseInitiale,
  executerRaffinement,
  executerValidationFragment,
  executerStrategie,
  executerMapping,
  executerApplicationDossier,
  demarrerDecouverteCompetences
} = require('../modules/decouverte-competences/decouverteMoteur.js');

beforeEach(() => { _decouverteReinitialiserJournal(); });

// ---------- Chemin normal : chaque etape trace un succes ----------

test('executerAnalyseInitiale : succes trace dans le journal avec le detail attendu', () => {
  var res = executerAnalyseInitiale('texte quelconque');
  assert.equal(res.succes, true);
  var journal = obtenirJournalExecutionDecouverte();
  assert.equal(journal.length, 1);
  assert.equal(journal[0].etape, 'analyse');
  assert.equal(journal[0].succes, true);
  assert.deepEqual(journal[0].details, { nbFragments: 2, nbQuestionsCiblees: 0 });
});

test('executerRaffinement : combine parsing puis transition en un seul appel', () => {
  var res = executerRaffinement({ fragmentId: 'f1', etat: 'propositionInitiale' }, 'texte');
  assert.equal(res.succes, true);
  assert.equal(res.etat, 'deuxiemeRaffinement');
  var journal = obtenirJournalExecutionDecouverte();
  assert.equal(journal[0].etape, 'raffinement');
  assert.equal(journal[0].details.fragmentId, 'f1');
});

test('executerRaffinement : un echec de parsing s\'arrete avant la transition, trace tel quel', () => {
  var res = executerRaffinement({ fragmentId: 'f1' }, 'echec');
  assert.equal(res.succes, false);
  assert.equal(res.erreur, 'erreur de lecture');
  assert.equal(obtenirJournalExecutionDecouverte()[0].details.erreur, 'erreur de lecture');
});

test('executerValidationFragment : succes trace avec le nombre de competences validees', () => {
  var res = executerValidationFragment({ fragmentId: 'f1' }, 'choix');
  assert.equal(res.succes, true);
  assert.equal(obtenirJournalExecutionDecouverte()[0].details.nbCompetencesValidees, 2);
});

test('executerStrategie : enveloppe le resultat dans { succes, valeurs }, jamais renvoye brut', () => {
  var res = executerStrategie([1, 2], {});
  assert.equal(res.succes, true);
  assert.equal(res.valeurs.metiersProposes.length, 3);
});

test('executerMapping : trace des compteurs derives, jamais le contenu complet dans le journal', () => {
  var res = executerMapping([1, 2], {});
  assert.equal(res.succes, true);
  var details = obtenirJournalExecutionDecouverte()[0].details;
  assert.equal(details.nbExperiences, 1);
  assert.equal(details.nbCompetences, 1);
  assert.equal(details.nbEntreesJournalProvenance, 2);
});

test('executerApplicationDossier : applique reellement au dossier fourni (effet de bord attendu)', () => {
  var dossier = { experiences: [] };
  var res = executerApplicationDossier(dossier, {});
  assert.equal(res.succes, true);
  assert.deepEqual(dossier.experiences, [1]);
});

// ---------- Chemin d'exception : le catch centralise ne laisse JAMAIS rien remonter ----------
// C'est la raison d'etre de ce fichier (voir son entete) : une erreur
// inattendue n'importe ou dans la chaine ne doit jamais casser le
// parcours sans message clair, ni exposer de detail technique a la
// personne (nom de fonction, pile d'appel).

test('executerAnalyseInitiale : une exception est absorbee, message generique renvoye, jamais le detail technique', () => {
  var res = executerAnalyseInitiale('exception');
  assert.equal(res.succes, false);
  assert.equal(res.erreur, 'Une erreur inattendue est survenue. Réessayez, ou signalez ce problème si cela persiste.');
  assert.ok(!res.erreur.includes('boom-analyse'));
});

test('executerRaffinement : une exception (parsing ou transition) est absorbee de la meme facon', () => {
  var res = executerRaffinement({ fragmentId: 'f1' }, 'exception');
  assert.equal(res.succes, false);
  assert.ok(res.erreur.startsWith('Une erreur inattendue'));
  assert.equal(obtenirJournalExecutionDecouverte()[0].details.exception, 'boom-raffinement');
});

test('executerValidationFragment : une exception est absorbee et tracee avec le fragmentId', () => {
  var res = executerValidationFragment({ fragmentId: 'f9' }, 'exception');
  assert.equal(res.succes, false);
  assert.equal(obtenirJournalExecutionDecouverte()[0].details.fragmentId, 'f9');
});

test('executerStrategie : une exception est absorbee, jamais propagee a l\'appelant', () => {
  var res = executerStrategie('exception', {});
  assert.equal(res.succes, false);
  assert.equal(obtenirJournalExecutionDecouverte()[0].succes, false);
});

test('executerMapping : une exception est absorbee, jamais propagee a l\'appelant', () => {
  var res = executerMapping('exception', {});
  assert.equal(res.succes, false);
});

test('executerApplicationDossier : une exception est absorbee, jamais propagee a l\'appelant', () => {
  var res = executerApplicationDossier({ exception: true }, {});
  assert.equal(res.succes, false);
});

// ---------- Journal d'execution ----------

test('obtenirJournalExecutionDecouverte : renvoie une copie, jamais la reference interne', () => {
  executerAnalyseInitiale('texte');
  var journal1 = obtenirJournalExecutionDecouverte();
  journal1.push('intrus');
  var journal2 = obtenirJournalExecutionDecouverte();
  assert.equal(journal2.length, 1);
});

test('_decouverteReinitialiserJournal : vide le journal entre deux parcours', () => {
  executerAnalyseInitiale('texte');
  assert.equal(obtenirJournalExecutionDecouverte().length, 1);
  _decouverteReinitialiserJournal();
  assert.equal(obtenirJournalExecutionDecouverte().length, 0);
});

// ---------- demarrerDecouverteCompetences ----------

test('demarrerDecouverteCompetences : trace le demarrage puis l\'echec si decouverteParcours.js n\'est pas charge', () => {
  delete global.ouvrirDecouverteCompetences;
  demarrerDecouverteCompetences();
  var journal = obtenirJournalExecutionDecouverte();
  assert.equal(journal[0].etape, 'demarrage');
  assert.equal(journal[0].succes, true);
  assert.equal(journal[1].succes, false);
});

test('demarrerDecouverteCompetences : delegue reellement a ouvrirDecouverteCompetences quand disponible', () => {
  var appele = false;
  global.ouvrirDecouverteCompetences = function () { appele = true; };
  demarrerDecouverteCompetences();
  assert.equal(appele, true);
  delete global.ouvrirDecouverteCompetences;
});
